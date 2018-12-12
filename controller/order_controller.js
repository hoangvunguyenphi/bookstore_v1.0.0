var AWS = require("aws-sdk");
//var upload_controller = require("../controller/upload_controller")
var Cart = require("./cart");

const UUID = require("uuid/v4");
var nanoid = require("nanoid");

let date = require("date-and-time");

var renameModule = require("../controller/edit_name");

var sio = require("../socket/socketio");

var awsconfig = require("../aws-config.json");
const accessKeyId = awsconfig.AWS.accessKeyId;
const secretAccessKey = awsconfig.AWS.secretAccessKey;
const region = awsconfig.AWS.region;

var endpoint = "http://localhost:8000";
AWS.config.update({
    accessKeyId,
    secretAccessKey,
    region
});

var ses = new AWS.SES();
let docClient = new AWS.DynamoDB.DocumentClient();

//===============================================================================================================================
// Thêm mới order từ khách, gửi thông tin đơn hàng và link xác nhận sang email
exports.add_order = function(req, res, next) {
    if (!req.session.cart) {
        return res.render("../views/site/page/cart", {
            products: [],
            totalPrice: 0,
            totalQty: 0,
            title: "Giỏ hàng"
        });
    }
    var cart = new Cart(req.session.cart);
    var now = date.format(new Date(), "DD/MM/YYYY HH:mm:ss");
    var tt0 = {
        tentinhtrang: "Chờ xác nhận",
        thoigian: now.toString(),
        motatt:
            "Đơn hàng đang ở trạng thái chờ được khách hàng xác nhận (Thư xác nhận được gửi vào email của khách hàng)."
    };
    var params = {
        TableName: "DA2Order",
        Item: {
            _orderID: nanoid(10),
            ngaylaphoadon: now.toString(),
            tennguoinhan: req.body.tennguoinhan,
            sodienthoai: req.body.sodienthoai,
            email: req.body.diachiemail,
            diachi: {
                xa_phuong: req.body.xa,
                quan_huyen: req.body.huyen,
                tinh_thanhpho: req.body.tinh,
                chitiet: req.body.diachichitiet
            },
            ghichu: req.body.ghichu || " ",
            items: cart.generateArray(),
            tienship: Number(req.body.edtTienship),
            tongtien: Number(cart.totalPrice),
            tongtienthanhtoan:
                Number(cart.totalPrice) + Number(req.body.edtTienship),
            tinhtranghienhanh: tt0.tentinhtrang,
            lichsutinhtrang: [tt0],
            codeDef: UUID(),
            ipClient: req.body.ipClient
        }
    };
    console.log(params);
    console.log(params.Item.items);
    var bodymail = `<table border="1"  style="width:100%;border-collapse: collapse;"><tr>
  <th>Sản phẩm</th>
  <th>Giá</th>
  <th>Số lượng</th>
  <th>Thành tiền</th>
</tr>`;

    params.Item.items.forEach(function(it) {
        bodymail +=
            `<tr>
  <td>
    ` +
            it.item.tieude +
            `
  </td>
  <td>
  ` +
            it.item.gia +
            `
  </td>
  <td>
    ` +
            it.qty +
            `
  </td>
  <td>
    ` +
            it.price +
            `
  </td>
</tr>`;
    });
    bodymail += "</table> ";
    docClient.put(params, function(err, data) {
        if (err) {
            console.error(
                "Unable to add book",
                ". Error JSON:",
                JSON.stringify(err, null, 2)
            );
        } else {
            req.session.cart = null;
            sio.thongBao(params.Item._orderID);
            var eparam = {
                Destination: {
                    ToAddresses: [params.Item.email]
                },
                Message: {
                    Body: {
                        Html: {
                            Data:
                                `<h2> Chào bạn ` +
                                params.Item.tennguoinhan +
                                `!</h2> <p>
                Đây là email với mục đích xác nhận đơn hàng bạn vừa đặt, vui lòng kiểm tra thông tin bên dưới và sau đó ` +
                                `<b><a style="font-size:25px" href="http://localhost:3000/xacNhanOrder/` +
                                params.Item.codeDef +
                                `
                ">nhấn vào đây ✔✔</a> </b> để xác nhận đơn hàng !</p>` +
                                `<p><b>Thông tin người nhận</b></p><table  border="1"  style="width:100%;border-collapse: collapse;"><tr>
                <td>Mã đơn hàng</td><td>` +
                                params.Item._orderID +
                                `</td>
                </tr>
                <tr>
                  <td>Tên người nhận:</td><td>` +
                                params.Item.tennguoinhan +
                                `</td>
                </tr>
                <tr>
                  <td>Địa chỉ nhận</td><td>` +
                                params.Item.diachi +
                                `</td>
                </tr>
                <tr>
                  <td>Số điện thoại nhận hàng</td><td>` +
                                params.Item.sodienthoai +
                                `</td>
                </tr>
                </table>
                <p><b>Thông tin đơn hàng</b></p>
                ` +
                                bodymail
                        },
                        Text: {
                            Data: "Mã đơn hàng:" + params.Item._orderID
                        }
                    },
                    Subject: {
                        Data: "[Sách] Xác nhận đơn đặt hàng! "
                    }
                },
                Source: "vitconse@gmail.com",
                ReplyToAddresses: ["vitconse@gmail.com"],
                ReturnPath: "vitconse@gmail.com"
            };
            // ses.sendEmail(eparam, function(err, data) {
            //   if (err) console.log(err);
            //   else {
            //    console.log(data);
            res.render("../views/site/page/order-received.ejs", {
                recieved_order: params.Item,
                products: [],
                totalPrice: 0,
                totalQty: 0,
                title: "Thông tin đơn hàng"
            });
            //   }
            // });
        }
    });
};

//===============================================================================================================================
// Xác nhận order qua mail từ khách, cập nhật tình trạng là "Đã xác nhận"
exports.xacNhanOrder = function(req, res) {
    var codeDef = req.params.codeDef;
    console.log(codeDef);
    var sparams = {
        TableName: "DA2Order",
        FilterExpression: "#code = :cd",
        ExpressionAttributeValues: {
            ":cd": codeDef
        },
        ExpressionAttributeNames: {
            "#code": "codeDef"
        }
    };
    docClient.scan(sparams, function(err, data) {
        if (err) {
            res.send("Đơn đặt hàng đã hết hạn!");
            console.error(
                "Unable to query. Error:",
                JSON.stringify(err, null, 2)
            );
        } else {
            data.Items.forEach(function(tt) {
                var orderID = tt._orderID;
                var now = date.format(new Date(), "DD/MM/YYYY");
                var tt = {
                    tentinhtrang: "Đã xác nhận",
                    thoigian: now.toString(),
                    motatt:
                        "Đơn hàng đã được xác nhận bởi khách hàng, chuyển sang trạng thái chờ chấp nhận từ quản trị."
                };
                var params = {
                    TableName: "DA2Order",
                    Key: {
                        _orderID: orderID
                    },
                    ReturnValues: "ALL_NEW",
                    UpdateExpression:
                        "set  #tthh=:hh, #lstt= list_append(if_not_exists(#lstt, :empty_list), :ls)",
                    ExpressionAttributeValues: {
                        ":hh": tt.tentinhtrang,
                        ":ls": [tt],
                        ":empty_list": []
                    },
                    ExpressionAttributeNames: {
                        "#tthh": "tinhtranghienhanh",
                        "#lstt": "lichsutinhtrang"
                    }
                };
                docClient.update(params, function(err, data) {
                    if (err) {
                        console.log(
                            "order - tinhtrang ::update::error - " +
                                JSON.stringify(err, null, 2)
                        );
                    } else {
                        console.log(
                            "order - tinhtrang ::update::success " +
                                JSON.stringify(data)
                        );
                        res.render("../views/site/page/trac.ejs"); ///track order
                    }
                });
            });
        }
    });
};

//===============================================================================================================================
// Chấp nhận đơn hàng, cập nhật tình trạng là "Chấp nhận đơn hàng và đóng gói sản phẩm"
exports.confirmOrder = function(req, res) {
    var orderID = req.params.id;
    var now = date.format(new Date(), "DD/MM/YYYY");
    var tt = {
        tentinhtrang: "Chấp nhận đơn hàng",
        thoigian: now.toString(),
        motatt:
            "Đơn hàng đã được quản trị chấp nhận và chuẩn bị tiến hành các bước đóng gói sản phẩm và giao hàng"
    };
    var params = {
        TableName: "DA2Order",
        Key: {
            _orderID: orderID
        },
        ReturnValues: "ALL_NEW",
        UpdateExpression:
            "set  #tthh=:hh, #lstt= list_append(if_not_exists(#lstt, :empty_list), :ls)",
        ExpressionAttributeValues: {
            ":hh": tt.tentinhtrang,
            ":ls": [tt],
            ":empty_list": []
        },
        ExpressionAttributeNames: {
            "#tthh": "tinhtranghienhanh",
            "#lstt": "lichsutinhtrang"
        }
    };
    docClient.update(params, function(err, data) {
        if (err) {
            console.log(
                "users::update::error - " + JSON.stringify(err, null, 2)
            );
        } else {
            sio.xoaThongBao(orderID);
            // console.log("users::update::success " + JSON.stringify(data));
            res.redirect("/admin/order/new/");
        }
    });
};

//===============================================================================================================================
// Từ chối order, cập nhật tình trạng là "ĐÃ bị từ chối"
exports.rejectOrder = function(req, res) {
    var orderID = req.params.id;
    var now = date.format(new Date(), "DD/MM/YYYY");
    var tt = {
        tentinhtrang: "Bị huỷ",
        thoigian: now.toString(),
        motatt: req.body.txtLyDo || " "
    };
    var params = {
        TableName: "DA2Order",
        Key: {
            _orderID: orderID
        },
        ReturnValues: "ALL_NEW",
        UpdateExpression:
            "set  #tthh=:hh, #lstt= list_append(if_not_exists(#lstt, :empty_list), :ls)",
        ExpressionAttributeValues: {
            ":hh": tt.tentinhtrang,
            ":ls": [tt],
            ":empty_list": []
        },
        ExpressionAttributeNames: {
            "#tthh": "tinhtranghienhanh",
            "#lstt": "lichsutinhtrang"
        }
    };
    docClient.update(params, function(err, data) {
        if (err) {
            console.log(
                "users::update::error - " + JSON.stringify(err, null, 2)
            );
        } else {
            sio.xoaThongBao(orderID);
            res.redirect("/admin/order/new/");
        }
    });
};

//===============================================================================================================================
// Lấy tất cả các order
exports.getAllOrder = function(req, res) {
    var params = {
        TableName: "DA2Order",
        FilterExpression:
            "contains (tinhtranghienhanh, :tt1) OR contains (tinhtranghienhanh, :tt2) OR contains (tinhtranghienhanh, :tt3) OR contains (tinhtranghienhanh, :tt4)",
        ExpressionAttributeValues: {
            ":tt1": "Chấp nhận đơn hàng",
            ":tt2": "Đang đóng gói sản phẩm",
            ":tt3": "Đang giao hàng",
            ":tt4": "Hoàn tất"
        }
    };
    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            console.error(
                "\nUnable to scan the table. Error JSON:",
                JSON.stringify(err, null, 2)
            );
            res.send(JSON.stringify(err, null, 2));
        } else {
            res.render("../views/admin/page/list-order.ejs", {
                allOrder: data.Items
            });
        }
    }
};

//===============================================================================================================================
//Lấy tất cả các đơn hàng ĐÃ ĐƯỢC XÁC NHẬN QUA MAIL bởi khách hàng????
exports.getNewOrders = function(req, res) {
    var params = {
        TableName: "DA2Order",
        FilterExpression: "tinhtranghienhanh = :cd",
        ExpressionAttributeValues: {
            ":cd": "Đã xác nhận"
        }
    };
    docClient.scan(params, onScan);
    function onScan(err, data) {
        if (err) {
            console.error(
                "\nUnable to scan the table. Error JSON:",
                JSON.stringify(err, null, 2)
            );
            res.send(JSON.stringify(err, null, 2));
        } else {
            res.render("../views/admin/page/list-new-order.ejs", {
                allOrder: data.Items
            });
        }
    }
};

//===============================================================================================================================
//Lấy tất cả các đơn hàng bị từ chối bởi admin hoặc huỷ bởi khách
exports.getRejectOrders = function(req, res) {
    var params = {
        TableName: "DA2Order",
        FilterExpression: "tinhtranghienhanh = :cd",
        ExpressionAttributeValues: {
            ":cd": "Bị huỷ"
        }
    };
    docClient.scan(params, onScan);
    function onScan(err, data) {
        if (err) {
            console.error(
                "\nUnable to scan the table. Error JSON:",
                JSON.stringify(err, null, 2)
            );
            res.send(JSON.stringify(err, null, 2));
        } else {
            res.render("../views/admin/page/list-reject-order.ejs", {
                allOrder: data.Items
            });
        }
    }
};

//===============================================================================================================================
//Lấy tất cả các đơn hàng bị từ chối bởi admin hoặc huỷ bởi khách
exports.getUnAuthenOrders = function(req, res) {
    var params = {
        TableName: "DA2Order",
        FilterExpression: "tinhtranghienhanh= :tt ",
        ExpressionAttributeValues: {
            ":tt": "Chờ xác nhận"
        }
    };
    docClient.scan(params, onScan);
    function onScan(err, data) {
        if (err) {
            console.error(
                "\nUnable to scan the table. Error JSON:",
                JSON.stringify(err, null, 2)
            );
            res.send(JSON.stringify(err, null, 2));
        } else {
            res.render("../views/admin/page/list-unauthen-order.ejs", {
                allOrder: data.Items
            });
        }
    }
};

//===============================================================================================================================
//Lấy chi tiết thông tin đơn hàng theo ID
exports.getDetailOrder = function(req, res) {
    var orderID = req.params.id;
    var params = {
        TableName: "DA2Order",
        KeyConditionExpression: "#ma = :id",
        ExpressionAttributeNames: {
            "#ma": "_orderID"
        },
        ExpressionAttributeValues: {
            ":id": orderID
        }
    };
    docClient.query(params, function(err, data) {
        if (err) {
            console.log(
                "Unable to query. Error:",
                JSON.stringify(err, null, 2)
            );
            res.send(JSON.stringify(err, null, 2));
        } else {
            res.render("../views/admin/page/orderDetail.ejs", {
                orderDetail: data.Items
            });
        }
    });
};

//===============================================================================================================================
// Lấy chi tiết thông tin đơn hàng mới theo ID
exports.getDetailOrderNew = function(req, res) {
    var orderID = req.params.id;
    var params = {
        TableName: "DA2Order",
        KeyConditionExpression: "#ma = :id",
        ExpressionAttributeNames: {
            "#ma": "_orderID"
        },
        ExpressionAttributeValues: {
            ":id": orderID
        }
    };
    docClient.query(params, function(err, data) {
        if (err) {
            console.log(
                "Unable to query. Error:",
                JSON.stringify(err, null, 2)
            );
        } else {
            res.render("../views/admin/page/confirmOrderDetail.ejs", {
                orderDetail: data.Items
            });
        }
    });
};

//===============================================================================================================================
// Lấy cập nhật thông tin giao hàng order
exports.update_order = function(req, res) {
    var orderID = req.params.id;
    var order = {
        TableName: "DA2Order",
        Item: {
            _orderID: orderID,
            tennguoinhan: req.body.editHoTen,
            sodienthoai: req.body.editSDT,
            diachi: req.body.editDiaChi,
            ghichu: req.body.editGhichu || " "
        }
    };
    console.log(order);

    var params = {
        TableName: order.TableName,
        Key: {
            _orderID: orderID
        },
        UpdateExpression:
            "set  #nguoinhan=:nn, #sdt=:sdt, #diachi=:dc, #ghichu=:gc",
        ExpressionAttributeValues: {
            ":nn": order.Item.tennguoinhan,
            ":sdt": order.Item.sodienthoai,
            ":dc": order.Item.diachi,
            ":gc": order.Item.ghichu
        },
        ExpressionAttributeNames: {
            "#nguoinhan": "tennguoinhan",
            "#sdt": "sodienthoai",
            "#diachi": "diachi",
            "#ghichu": "ghichu"
        },
        ReturnValues: "UPDATED_NEW"
    };
    docClient.update(params, function(err, data) {
        if (err) {
            console.log(
                "users::update::error - " + JSON.stringify(err, null, 2)
            );
        } else {
            // console.log("users::update::success " + JSON.stringify(data));
            res.redirect("/admin/order/detail/" + orderID);
        }
    });
};

//===============================================================================================================================
// Lấy cập nhật thông tin giao hàng order
exports.update_tinhtrang_order = function(req, res) {
    var orderID = req.params.id;
    var now = date.format(new Date(), "DD/MM/YYYY");
    var tt = {
        tentinhtrang: req.body.editTinhTrang,
        thoigian: now.toString(),
        motatt: req.body.editMoTaTT || " "
    };
    console.log(tt);
    var params = {
        TableName: "DA2Order",
        Key: {
            _orderID: orderID
        },
        ReturnValues: "ALL_NEW",
        UpdateExpression:
            "set  #tthh=:hh, #lstt= list_append(if_not_exists(#lstt, :empty_list), :ls)",
        ExpressionAttributeValues: {
            ":hh": tt.tentinhtrang,
            ":ls": [tt],
            ":empty_list": []
        },
        ExpressionAttributeNames: {
            "#tthh": "tinhtranghienhanh",
            "#lstt": "lichsutinhtrang"
        }
    };
    docClient.update(params, function(err, data) {
        if (err) {
            console.log(
                "users::update::error - " + JSON.stringify(err, null, 2)
            );
        } else {
            // console.log("users::update::success " + JSON.stringify(data));
            res.redirect("/admin/order/detail/" + orderID);
        }
    });
};

//===============================================================================================================================
exports.trackOrder = function(req, res) {
    if (!req.session.cart) {
        return res.render("../views/site/page/track-your-order.ejs", {
            products: [],
            totalPrice: 0,
            totalQty: 0,
            title: "Tra cứu đơn hàng",
            ketquatim: " "
        });
    }
    var cart = new Cart(req.session.cart);
    res.render("../views/site/page/track-your-order.ejs", {
        products: cart.generateArray(),
        totalPrice: cart.totalPrice,
        totalQty: cart.totalQty,
        title: "Tra cứu đơn hàng",
        ketquatim: " "
    });
};

exports.searchOrder = function(req, res) {
    var orderID = req.body.orderidd;
    var emaill = req.body.order_emaill;
    var params = {
        TableName: "DA2Order",
        FilterExpression: "#ma = :id and #email = :em",
        ExpressionAttributeNames: {
            "#ma": "_orderID",
            "#email": "email"
        },
        ExpressionAttributeValues: {
            ":id": orderID,
            ":em": emaill
        }
    };
    docClient.scan(params, function(err, data) {
        if (err) {
            console.log(
                "Unable to query. Error:",
                JSON.stringify(err, null, 2)
            );
        } else {
            console.log(data);
            if (data.Count == 0) {
                if (!req.session.cart) {
                    return res.render(
                        "../views/site/page/track-your-order.ejs",
                        {
                            products: [],
                            totalPrice: 0,
                            totalQty: 0,
                            title: "Tra cứu đơn hàng",
                            ketquatim: "Không tìm thấy đơn hàng nào phù hợp !"
                        }
                    );
                }
                var cart = new Cart(req.session.cart);
                res.render("../views/site/page/track-your-order.ejs", {
                    products: cart.generateArray(),
                    totalPrice: cart.totalPrice,
                    totalQty: cart.totalQty,
                    title: "Tra cứu đơn hàng",
                    ketquatim: "Không tìm thấy đơn hàng nào phù hợp !"
                });
            } else {
                if (!req.session.cart) {
                    return res.render(
                        "../views/site/page/result-track-order.ejs",
                        {
                            products: [],
                            totalPrice: 0,
                            totalQty: 0,
                            title: "Tra cứu đơn hàng",
                            orderDetail: data.Items
                        }
                    );
                }
                var cart = new Cart(req.session.cart);
                res.render("../views/site/page/result-track-order.ejs", {
                    products: cart.generateArray(),
                    totalPrice: cart.totalPrice,
                    totalQty: cart.totalQty,
                    title: "Tra cứu đơn hàng",
                    orderDetail: data.Items
                });
            }
        }
    });
};

exports.getOrderTrack = function(req, res) {
    var orderID = req.params.id;
    var emaill = req.params.mail;
    var params = {
        TableName: "DA2Order",
        FilterExpression: "#ma = :id and #email = :em",
        ExpressionAttributeNames: {
            "#ma": "_orderID",
            "#email": "email"
        },
        ExpressionAttributeValues: {
            ":id": orderID,
            ":em": emaill
        }
    };
    docClient.scan(params, function(err, data) {
        if (err) {
            console.log(
                "Unable to query. Error:",
                JSON.stringify(err, null, 2)
            );
            if (!req.session.cart) {
                return res.render("../views/site/page/track-your-order.ejs", {
                    products: [],
                    totalPrice: 0,
                    totalQty: 0,
                    title: "Tra cứu đơn hàng",
                    ketquatim: "Không tìm thấy đơn hàng nào phù hợp !"
                });
            }
            var cart = new Cart(req.session.cart);
            res.render("../views/site/page/track-your-order.ejs", {
                products: cart.generateArray(),
                totalPrice: cart.totalPrice,
                totalQty: cart.totalQty,
                title: "Tra cứu đơn hàng",
                ketquatim: "Không tìm thấy đơn hàng nào phù hợp !"
            });
        } else {
            console.log(data);
            if (data.Count == 0) {
                if (!req.session.cart) {
                    return res.render(
                        "../views/site/page/track-your-order.ejs",
                        {
                            products: [],
                            totalPrice: 0,
                            totalQty: 0,
                            title: "Tra cứu đơn hàng",
                            ketquatim: "Không tìm thấy đơn hàng nào phù hợp !"
                        }
                    );
                }
                var cart = new Cart(req.session.cart);
                res.render("../views/site/page/track-your-order.ejs", {
                    products: cart.generateArray(),
                    totalPrice: cart.totalPrice,
                    totalQty: cart.totalQty,
                    title: "Tra cứu đơn hàng",
                    ketquatim: "Không tìm thấy đơn hàng nào phù hợp !"
                });
            } else {
                if (!req.session.cart) {
                    return res.render(
                        "../views/site/page/result-track-order.ejs",
                        {
                            products: [],
                            totalPrice: 0,
                            totalQty: 0,
                            title: "Tra cứu đơn hàng",
                            orderDetail: data.Items
                        }
                    );
                }
                var cart = new Cart(req.session.cart);
                res.render("../views/site/page/result-track-order.ejs", {
                    products: cart.generateArray(),
                    totalPrice: cart.totalPrice,
                    totalQty: cart.totalQty,
                    title: "Tra cứu đơn hàng",
                    orderDetail: data.Items
                });
            }
        }
    });
};
