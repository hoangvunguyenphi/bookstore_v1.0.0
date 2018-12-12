var AWS = require("aws-sdk");
var Cart = require("./cart");
var fs = require("fs");
var UUID = require("uuid/v4");
var date = require("date-and-time");
var renameModule = require("../controller/edit_name");
var awsconfig = require("../aws-config.json");
let authen_controller = require("../controller/authentication_controller");
var accessKeyId = awsconfig.AWS.accessKeyId;
var secretAccessKey = awsconfig.AWS.secretAccessKey;
var region = awsconfig.AWS.region;
var endpoint = "http://localhost:8000";
AWS.config.update({
    accessKeyId,
    secretAccessKey,
    region
});
let docClient = new AWS.DynamoDB.DocumentClient();

//GET ALL BOOK
exports.get_all_book = function(req, res, next) {
    var params = {
        TableName: "DA2Book",
        ProjectionExpression:
            "#bookID, theloai, tieude, hinhanh, gia, danhdau, linkseo, tinhtrang",
        ExpressionAttributeNames: {
            "#bookID": "_bookID"
        },
        Limit: 40
        /*
        Limit: 50
        FilterExpression: 'contains(#d, :d1) or contains(#d, :d2) or contains(#d, :d3)',
        ExpressionAttributeNames: {
          '#bookID': '_bookID',
          '#d': 'danhdau'
        },
        ExpressionAttributeValues: {
          ':d1': 'new',
          ':d2': 'weekdeal',
          ":d3": 'popular'
        }*/
    };
    //DUYET TAT CA COLLECTIONS TREN TABLE
    docClient.scan(params, function(err, data) {
        if (err) {
            console.log(
                "\nUnable to scan the table. Error JSON:",
                JSON.stringify(err, null, 2)
            );
            res.render("error");
        } else {
            console.log(data.Count);
            //nếu session rỗng
            if (!req.session.cart) {
                return res.render("../views/site/page/index", {
                    products: [], //cartItem
                    allBooks: data.Items,
                    totalPrice: 0,
                    totalQty: 0,
                    title: "Trang chủ"
                });
            }
            //ngược lại đang trong phiên session
            var cart = new Cart(req.session.cart);
            res.render("../views/site/page/index", {
                products: cart.generateArray(),
                allBooks: data.Items,
                totalPrice: cart.totalPrice,
                totalQty: cart.totalQty,
                title: "Trang chủ"
            });
        }
    });
};
//GET CHI TIET SPs
exports.get_detail_product = function(req, res, next) {
    var sachID = req.params.id;
    console.log("\n_________" + sachID);

    var params = {
        TableName: "DA2Book",
        KeyConditionExpression: "#ma = :id",
        ExpressionAttributeNames: {
            "#ma": "_bookID"
        },
        ExpressionAttributeValues: {
            ":id": sachID
        }
    };
    //Thực hiện query object theo id lấy từ req.params
    docClient.query(params, function(err, data) {
        if (err) {
            console.log(
                "Unable to query. Error:",
                JSON.stringify(err, null, 2)
            );
        } else {
            if (!req.session.cart) {
                return res.render("../views/site/page/single-product", {
                    sachDetail: data.Items,
                    products: [],
                    allBooks: data.Items,
                    totalPrice: 0,
                    totalQty: 0,
                    title: data.Items.tieude
                });
            }
            var cart = new Cart(req.session.cart);
            res.render("../views/site/page/single-product", {
                sachDetail: data.Items,
                allBooks: data.Items,
                products: cart.generateArray(),
                totalPrice: cart.totalPrice,
                totalQty: cart.totalQty,
                title: data.Items.tieude
            });
        }
    });
};

exports.edit_book = function(req, res, next) {
    /**
     * @author N.T.Sơn
     * Kiểm tra session có timeout hay không? Nếu có thì redirect về trang login
     * Nếu bị redirect thì _headerSent là true và ngược lại.
     */
    authen_controller.check_session_auth(req, res);
    if (res._headerSent) return;

    var bookid = req.params.id;
    console.log(req.body.newTinhTrang);
    var editBook = {
        tacgia: renameModule.splitList(req.body.newTacGia),
        tieude: req.body.newTieuDe,
        theloai: String(req.body.newTheLoai),
        SKU: req.body.newSKU,
        ngayxuatban: req.body.newNgayXuatBan,
        nhaxuatban: req.body.newNhaXuatBan,
        kichthuoc: req.body.newKichThuoc,
        mota: req.body.newMoTa,
        dichgia: renameModule.splitList(req.body.newDichGia),
        ngonngu: req.body.newNgonNgu,
        tinhtrang: renameModule.splitList(req.body.newTinhTrang) || [],
        danhdau: renameModule.splitList(req.body.newDanhDau) || [],
        linkseo: req.body.newLinkSeo,
        sotrang: parseInt(req.body.newSoTrang),
        gia: parseFloat(req.body.newGia)
    };
    console.log(editBook);
    var params = {
        TableName: "DA2Book",
        Key: {
            _bookID: bookid
        },
        UpdateExpression:
            "set #sku=:sk, #tieude=:td, #tacgia=:tg, #dichgia=:dg, #theloai=:tl,#tinhtrang=:tt,#ngonngu=:nn,#ngayxuatban=:txb,#nhaxuatban=:nxb,#sotrang=:st,#mota=:mt,#danhdau=:dd,#gia=:g",
        ExpressionAttributeValues: {
            ":sk": editBook.SKU,
            ":td": editBook.tieude,
            ":tg": editBook.tacgia,
            ":dg": editBook.dichgia,
            ":tl": editBook.theloai,
            ":tt": editBook.tinhtrang,
            ":nn": editBook.ngonngu,
            ":txb": editBook.ngayxuatban,
            ":nxb": editBook.nhaxuatban,
            ":st": editBook.sotrang,
            ":mt": editBook.mota,
            ":dd": editBook.danhdau,
            ":g": editBook.gia
        },
        ExpressionAttributeNames: {
            "#sku": "SKU",
            "#tieude": "tieude",
            "#tacgia": "tacgia",
            "#dichgia": "dichgia",
            "#theloai": "theloai",
            "#tinhtrang": "tinhtrang",
            "#ngonngu": "ngonngu",
            "#ngayxuatban": "ngayxuatban",
            "#nhaxuatban": "nhaxuatban",
            "#sotrang": "sotrang",
            "#mota": "mota",
            "#danhdau": "danhdau",
            "#gia": "gia"
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
            res.redirect("/admin/product/detail/" + bookid);
        }
    });
};

exports.delete_book = function(req, res, next) {
    /**
     * @author N.T.Sơn
     * Kiểm tra session có timeout hay không? Nếu có thì redirect về trang login
     * Nếu bị redirect thì _headerSent là true và ngược lại.
     */
    authen_controller.check_session_auth(req, res);
    if (res._headerSent) return;

    var bookID = req.params.id;
    console.log("\nRemoved book ID: " + bookID);
    var params = {
        TableName: "DA2Book",
        Key: {
            _bookID: bookID
        }
    };
    docClient.delete(params, function(err, data) {
        if (err) {
            console.log(
                "users::delete::error - " + JSON.stringify(err, null, 2)
            );
        } else {
            console.log("users::delete::success");
            res.redirect("/admin/product");
        }
    });
};

exports.admin_search_book = function(req, res, next) {
    /**
     * @author N.T.Sơn
     * Kiểm tra session có timeout hay không? Nếu có thì redirect về trang login
     * Nếu bị redirect thì _headerSent là true và ngược lại.
     */
    authen_controller.check_session_auth(req, res);
    if (res._headerSent) return;

    var keySearch = req.body.txtSearch123123;
    console.log("__" + keySearch);
    if (keySearch.length != 0) {
        var params = {
            TableName: "DA2Book",
            FilterExpression: "contains(#id, :i) or contains(#tieude, :n) ",
            ExpressionAttributeValues: {
                ":i": keySearch,
                ":n": keySearch
            },
            ExpressionAttributeNames: {
                "#tieude": "tieude",
                "#id": "_bookID"
            }
        };

        docClient.scan(params, function(err, data) {
            if (err) {
                console.log(
                    "Unable to query. Error:",
                    JSON.stringify(err, null, 2)
                );
            } else {
                console.log("Query succeeded.");
                console.log(data.Items);
                res.render("../views/admin/page/ahome.ejs", {
                    allBooks: data.Items
                });
            }
        });
    } else {
        res.redirect("/admin");
    }
};

exports.show_list_cat = function(req, res) {
    var category = req.params.theloai;
    console.log(category);
    var params = {
        TableName: "DA2Book",
        FilterExpression: "#tl=:tloai",
        ExpressionAttributeValues: {
            ":tloai": category
        },
        ExpressionAttributeNames: {
            "#tl": "theloai"
        }
    };

    docClient.scan(params, function(err, data) {
        if (err) {
            console.log(
                "Unable to query. Error:",
                JSON.stringify(err, null, 2)
            );
        } else {
            console.log("\nSố lượng tìm dc=" + data.Count);
            if (!req.session.cart) {
                return res.render("../views/site/page/list-book-cat.ejs", {
                    products: [],
                    allBooks: data.Items,
                    totalPrice: 0,
                    totalQty: 0,
                    title: category
                });
            }
            //ngược lại đang trong phiên session
            var cart = new Cart(req.session.cart);
            res.render("../views/site/page/list-book-cat.ejs", {
                allBooks: data.Items,
                products: cart.generateArray(),
                totalPrice: cart.totalPrice,
                totalQty: cart.totalQty,
                title: category
            });
        }
    });
};
exports.show_list_cat2 = function(req, res, next) {
    var dd = req.params.danhdau;
    console.log(dd);
    var params = {
        TableName: "DA2Book",
        FilterExpression: "contains(#dd, :danhdau)",
        ExpressionAttributeValues: {
            ":danhdau": dd
        },
        ExpressionAttributeNames: {
            "#dd": "danhdau"
        }
    };
    docClient.scan(params, function(err, data) {
        if (err) {
            console.log(
                "Unable to query. Error:",
                JSON.stringify(err, null, 2)
            );
        } else {
            console.log("\nSố lượng tìm dc=" + data.Count);
            if (!req.session.cart) {
                return res.render("site/page/list-book-cat", {
                    products: [],
                    allBooks: data.Items,
                    totalPrice: 0,
                    totalQty: 0,
                    title: dd
                });
            }
            //ngược lại đang trong phiên session
            var cart = new Cart(req.session.cart);
            res.render("site/page/list-book-cat", {
                allBooks: data.Items,
                products: cart.generateArray(),
                totalPrice: cart.totalPrice,
                totalQty: cart.totalQty,
                title: dd
            });
        }
    });
};

exports.search_book = function(req, res, next) {
    var q = req.query.q;
    var cat = req.query.cat;

    q = renameModule.editName(q);

    if (typeof cat === "undefined" || cat === "cat0") {
        var params = {
            TableName: "DA2Book",
            FilterExpression: "contains(linkseo, :ls)",
            ExpressionAttributeValues: {
                ":ls": q
            }
        };
    } else {
        var params = {
            TableName: "DA2Book",
            FilterExpression: "contains(linkseo, :ls) and #tl=:tloai",
            ExpressionAttributeValues: {
                ":tloai": cat,
                ":ls": q
            },
            ExpressionAttributeNames: {
                "#tl": "theloai"
            }
        };
    }

    docClient.scan(params, function(err, data) {
        if (err) {
            console.log(
                "Unable to query. Error:",
                JSON.stringify(err, null, 2)
            );
        } else {
            console.log("\nSố lượng tìm dc=" + data.Count);
            if (!req.session.cart) {
                return res.render("../views/site/page/list-book-cat.ejs", {
                    products: [],
                    allBooks: data.Items,
                    totalPrice: 0,
                    totalQty: 0,
                    title: "Tìm kiếm"
                });
            }
            //ngược lại đang trong phiên session
            var cart = new Cart(req.session.cart);
            res.render("../views/site/page/list-book-cat.ejs", {
                allBooks: data.Items,
                products: cart.generateArray(),
                totalPrice: cart.totalPrice,
                totalQty: cart.totalQty,
                title: "Tìm kiếm"
            });
        }
    });
};
// exports.search_book = function(req, res) {
//     var keySearch = req.body.stieude;
//     var sltTheloai = req.body.product_cat;
//     console.log(keySearch + "-" + sltTheloai);
//     if (keySearch.length != 0) {
//         var params = {
//             TableName: "DA2Book",
//             FilterExpression: "contains(#key, :key) and contains(#tl, :tl) ",
//             ExpressionAttributeValues: {
//                 ":key": String(keySearch).trim() || " ",
//                 ":tl": String(sltTheloai).trim()
//             },
//             ExpressionAttributeNames: {
//                 "#key": "tieude",
//                 "#tl": "theloai"
//             }
//         };
//         docClient.scan(params, function(err, data) {
//             if (err) {
//                 console.log(
//                     "Unable to query. Error:",
//                     JSON.stringify(err, null, 2)
//                 );
//             } else {
//                 if (!req.session.cart) {
//                     return res.render("../views/site/page/list-book-cat.ejs", {
//                         products: [],
//                         allBooks: data.Items,
//                         totalPrice: 0,
//                         totalQty: 0,
//                         title: "Tìm kiếm"
//                     });
//                 }
//                 //ngược lại đang trong phiên session
//                 var cart = new Cart(req.session.cart);
//                 res.render("../views/site/page/list-book-cat.ejs", {
//                     allBooks: data.Items,
//                     products: cart.generateArray(),
//                     totalPrice: cart.totalPrice,
//                     totalQty: cart.totalQty,
//                     title: "Tìm kiếm"
//                 });
//             }
//         });
//     } else {
//         res.redirect("/");
//     }
// };

//GET ALL BOOK ADMIN
exports.get_all_book2 = function(req, res, next) {
    /**
     * @author N.T.Sơn
     * Kiểm tra session có timeout hay không? Nếu có thì redirect về trang login
     * Nếu bị redirect thì _headerSent là true và ngược lại.
     */
    authen_controller.check_session_auth(req, res);
    if (res._headerSent) return;

    console.log("Countinue!");
    var params = {
        TableName: "DA2Book"
    };
    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            console.log(
                "\nUnable to scan the table. Error JSON:",
                JSON.stringify(err, null, 2)
            );
        } else {
            console.log(data.Items.length);
            res.render("../views/admin/page/list-book.ejs", {
                allBooks: data.Items
            });
        }
    }
};

exports.get_detail_product2 = function(req, res) {
    /**
     * @author N.T.Sơn
     * Kiểm tra session có timeout hay không? Nếu có thì redirect về trang login
     * Nếu bị redirect thì _headerSent là true và ngược lại.
     */
    authen_controller.check_session_auth(req, res);
    if (res._headerSent) return;

    var sachID = req.params.id;
    console.log("\n_________" + sachID);

    var params = {
        TableName: "DA2Book",
        KeyConditionExpression: "#ma = :id",
        ExpressionAttributeNames: {
            "#ma": "_bookID"
        },
        ExpressionAttributeValues: {
            ":id": sachID
        }
    };
    docClient.query(params, function(err, data) {
        if (err) {
            console.log(
                "Unable to query. Error:",
                JSON.stringify(err, null, 2)
            );
        } else {
            res.render("../views/admin/page/bookDetail.ejs", {
                sachDetail: data.Items
            });
        }
    });
};
// var multer = require("multer");
// var multerS3 = require("multer-s3");
// var path = require("path");
// const mime = require("mime");

// var keyImgUpload = "";
// var s3 = new AWS.S3();
// var upload = multer({
//   limits: {
//     fileSize: 3 * 1024 * 1024
//   },
//   fileFilter: function (req, file, cb) {
//     var filetypes = /jpeg|jpg|png|gif|bmp/;
//     var mimetype = filetypes.test(file.mimetype);
//     var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     if (mimetype && extname) {
//       return cb(null, true);
//     }
//     cb(
//       "Error: File upload only supports the following filetypes - " + filetypes
//     );
//   },
//   storage: multerS3({
//     s3: s3,
//     bucket: "da2-book",
//     metadata: function (req, file, cb) {
//       cb(null, {
//         fieldName: file.originalname
//       });
//     },
//     acl: "public-read",
//     key: function (req, file, cb) {
//       console.log(file);
//       keyImgUpload = UUID() + "." + mime.getExtension(file.mimetype);
//       console.log(keyImgUpload);
//       cb(null, keyImgUpload);
//     }
//   })
// // });
// exports.add_new_book = upload.single("newImgUpload"),
//   function (req, res, next) {
//     var table = "DA2Book";
//     var buket = "da2-book";
//     var now = date.format(new Date(), "DD/MM/YYYY");
//     var url =
//       "https://" + buket + ".s3." + region + ".amazonaws.com/" + keyImgUpload;
//     var params = {
//       TableName: table,
//       Item: {
//         _bookID: UUID(),
//         tieude: req.body.newTieuDe,
//         theloai: req.body.newTheLoai,
//         sotrang: req.body.newSoTrang,
//         SKU: req.body.newSKU,
//         ngayxuatban: req.body.newNgayXuatBan,
//         nhaxuatban: req.body.newNhaXuatBan,
//         kichthuoc: req.body.newKichThuoc,
//         mota: req.body.newMoTa,
//         dichgia: req.body.newDichGia,
//         danhgia: " ",
//         tinhtrang: " ",
//         ngaythem: now.toString,
//         danhdau: req.body.newDanhDau,
//         danhgiasao: " ",
//         linkseo: renameModule.editName(req.body.newTieuDe),
//         sotrang: req.body.newSoTrang,
//         gia: req.body.newGia,
//         hinhanh: url
//       }
//     };
//     console.log(params);
//     res.redirect("/admin");
// docClient.put(params, function (err, data) {
//   if (err) {
//     console.error("Unable to add item. Error JSON:", JSON.stringify(err));
//   } else {
//     res.redirect("/admin");
//   }
// });
//};
