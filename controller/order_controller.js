var AWS = require("aws-sdk");
//var upload_controller = require("../controller/upload_controller")
var Cart = require("./cart");
const UUID = require("uuid/v4");
let date = require("date-and-time");
var renameModule = require("../controller/edit_name");
var awsconfig = require("../../aws-config.json");
var sio = require('../socket/socketio');
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
      totalQty: 0
    });
  }
  var cart = new Cart(req.session.cart);
  var now = date.format(new Date(), "DD/MM/YYYY");
  var params = {
    TableName: "DA2Order",
    Item: {
      _orderID: UUID(),
      ngaylaphoadon: now.toString(),
      tennguoinhan: req.body.tennguoinhan,
      sodienthoai: req.body.sodienthoai,
      email: req.body.diachiemail,
      diachi: req.body.diachichitiet,
      ghichu: req.body.ghichu || " ",
      tienship: 1111,
      items: cart.generateArray(),
      tongtienthanhtoan: cart.totalPrice,
      tinhtrang: "Chờ xác nhận",
      ngaythanhtoan: " ",
      codeDef: UUID(),
      ipClient: req.body.ipClient // có thể sẽ check ip customer để tránh spam, thêm condition Expression limit đơn đặt hàng trong 1 khoảng time// chưa làm
    }
  };
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
            totalPrice: params.Item.tongtienthanhtoan,
            tienship: params.Item.tienship,
            totalQty: 0
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
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      data.Items.forEach(function(tt) {
        console.log(tt.tinhtrang);
        var params = {
          TableName: "DA2Order",
          Key: {
            _orderID: tt._orderID
          },
          UpdateExpression: "set #tinhtrang=:ttr",
          ExpressionAttributeValues: {
            ":ttr": "Đã xác nhận"
          },
          ExpressionAttributeNames: {
            "#tinhtrang": "tinhtrang"
          },
          ReturnValues: "UPDATED_NEW"
        };
        docClient.update(params, function(err, data) {
          if (err) {
            console.log(
              "order - tinhtrang ::update::error - " +
                JSON.stringify(err, null, 2)
            );
          } else {
            console.log(
              "order - tinhtrang ::update::success " + JSON.stringify(data)
            );
            res.render("../views/site/page/trac.ejs");
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
  var params = {
    TableName: "DA2Order",
    Key: {
      _orderID: orderID
    },
    UpdateExpression:
      "set #tinhtrang=:tt ",
    ExpressionAttributeValues: {
      ":tt": "Chấp nhận đơn hàng và đóng gói sản phẩm"
    },
    ExpressionAttributeNames: {
      "#tinhtrang": "tinhtrang",
    },
    ReturnValues: "UPDATED_NEW"
  };
  docClient.update(params, function(err, data) {
    if (err) {
      console.log("users::update::error - " + JSON.stringify(err, null, 2));
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
  var params = {
    TableName: "DA2Order",
    Key: {
      _orderID: orderID
    },
    UpdateExpression:
      "set #tinhtrang=:tt ",
    ExpressionAttributeValues: {
      ":tt": "Đã bị từ chối"
    },
    ExpressionAttributeNames: {
      "#tinhtrang": "tinhtrang",
    },
    ReturnValues: "UPDATED_NEW"
  };
  docClient.update(params, function(err, data) {
    if (err) {
      console.log("users::update::error - " + JSON.stringify(err, null, 2));
    } else {
      sio.xoaThongBao(orderID);
      // console.log("users::update::success " + JSON.stringify(data));
      res.redirect("/admin/order/new/");
    }
  });
};



//===============================================================================================================================
// Lấy tất cả các order
exports.getAllOrder = function(req, res) {
  var params = {
    TableName: "DA2Order"
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
    FilterExpression: "#tt = :cd",
    ExpressionAttributeValues: {
      ":cd": "Chờ xác nhận"
    },
    ExpressionAttributeNames: {
      "#tt": "tinhtrang"
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
      console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
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
      console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
      res.render("../views/admin/page/confirmOrderDetail.ejs", {
        orderDetail: data.Items
      });
    } else {
      res.render("../views/admin/page/confirmOrderDetail.ejs", {
        orderDetail: data.Items
      });
    }
  });
};


//===============================================================================================================================
// Lấy cập nhật thông tin order
exports.update_order = function(req, res) {
  var orderID = req.params.id;
  var order = {
    TableName: "DA2Order",
    Item: {
      _orderID: orderID,
      ngaylaphoadon: req.body.editNgayLap,
      tennguoinhan: req.body.editHoTen,
      sodienthoai: req.body.editSDT,
      email: req.body.editEmail,
      diachi: req.body.editDiaChi,
      ghichu: req.body.editGhichu || " ",
      // tienship: 1111,
      // items: cart.generateArray(),
      // tongtienthanhtoan: cart.totalPrice,
      tinhtrang: req.body.editTinhTrang,
      ngaythanhtoan: req.body.editNgayThanhToan|| " "
      // codeDef: UUID(),
      //ipClient: req.body.ipClient // có thể sẽ check ip customer để tránh spam, thêm condition Expression limit đơn đặt hàng trong 1 khoảng time// chưa làm
    }
  };
  console.log(order);

  var params = {
    TableName: order.TableName,
    Key: {
      _orderID: orderID
    },
    UpdateExpression:
      "set #ngaylap=:nl, #nguoinhan=:nn, #sdt=:sdt, #email=:e, #diachi=:dc, #ghichu=:gc, #tinhtrang=:tt, #ngaytt=:ntt",
    ExpressionAttributeValues: {
      ":nl": order.Item.ngaylaphoadon,
      ":nn": order.Item.tennguoinhan,
      ":sdt": order.Item.sodienthoai,
      ":e": order.Item.email,
      ":dc": order.Item.diachi,
      ":gc": order.Item.ghichu,
      ":tt": order.Item.tinhtrang,
      ":ntt": order.Item.ngaythanhtoan
    },
    ExpressionAttributeNames: {
      "#ngaylap": "ngaylaphoadon",
      "#nguoinhan": "tennguoinhan",
      "#sdt": "sodienthoai",
      "#email": "email",
      "#diachi": "diachi",
      "#ghichu": "ghichu",
      "#tinhtrang": "tinhtrang",
      "#ngaytt": "ngaythanhtoan"
    },
    ReturnValues: "UPDATED_NEW"
  };
  docClient.update(params, function(err, data) {
    if (err) {
      console.log("users::update::error - " + JSON.stringify(err, null, 2));
    } else {
      // console.log("users::update::success " + JSON.stringify(data));
      res.redirect("/admin/order/detail/" + orderID);
    }
  });
};

exports.trackOrder = function(req,res){
  if (!req.session.cart) {
    return res.render("../views/site/page/track-your-order.ejs", {
      products: [],
      totalPrice: 0,
      totalQty: 0
    });
  }
  var cart = new Cart(req.session.cart);
  res.render("../views/site/page/track-your-order.ejs", {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
    totalQty: cart.totalQty
  });
}