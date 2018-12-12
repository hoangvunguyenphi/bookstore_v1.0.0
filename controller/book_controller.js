var AWS = require("aws-sdk");
var Cart = require("./cart");
var fs = require("fs");
var UUID = require("uuid/v4");
var date = require("date-and-time");
var renameModule = require("../controller/edit_name");
var awsconfig = require("../../aws-config.json");
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

/**
 * @author Nguyễn Thế Sơn
 * Cập nhật thư viện request và cập nhật file api-mapping.json
 */
let request = require('request');
let api_mapping = require('./api-mapping.json');

//GET ALL BOOK
exports.get_all_book = function(req, res, next) {

  /**
   * @author Nguyễn Thế Sơn
   * Đã hoàn tất mapping api
   * Chưa test lại
   */
  request.get(api_mapping.client_get_all_book.url, { json: true }, (err, response, data) => {
    if (err) {
      console.log(
        "\nUnable to scan the table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.render("error");
    } else {
      console.log(data)
      console.log(data.Count);
      //nếu session rỗng
      if (!req.session.cart) {
        return res.render("../views/site/page/index", {
          products: [], //cartItem
          allBooks: data.Items,
          totalPrice: 0,
          totalQty: 0
        });
      }
      //ngược lại đang trong phiên session
      var cart = new Cart(req.session.cart);
      res.render("../views/site/page/index", {
        products: cart.generateArray(),
        allBooks: data.Items,
        totalPrice: cart.totalPrice,
        totalQty: cart.totalQty
      });
    }
  });
};
//GET CHI TIET SPs
exports.get_detail_product = function(req, res, next) {
  var sachID = req.params.id;
  console.log("\n_________" + sachID);

  /**
   * @author Nguyễn Thế Sơn
   * Đã hoàn thành mapping api
   * Chưa test lại
   */
  request.get(api_mapping.get_book_detail.url + sachID, { json: true }, (err, response, data) => {
    if (err) {
      console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      if (!req.session.cart) {
        return res.render("../views/site/page/single-product", {
          sachDetail: data.Items,
          products: [],
          allBooks: data.Items,
          totalPrice: 0,
          totalQty: 0
        });
      }
      var cart = new Cart(req.session.cart);
      res.render("../views/site/page/single-product", {
        sachDetail: data.Items,
        allBooks: data.Items,
        products: cart.generateArray(),
        totalPrice: cart.totalPrice,
        totalQty: cart.totalQty
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

  /**
   * @author Nguyễn Thế Sơn
   * Đã hoàn thành mapping
   * Chưa test lại
   */
  let formData = {
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
  }

  console.log(api_mapping.edit_book.url + bookid)
  console.log(formData)

  let option = { 
    url: api_mapping.edit_book.url + bookid, 
    form: encodeURI(JSON.stringify(formData))  
  }

  console.log(option)

  request.put(option, (err, response, data) => {
    if (err) {
      console.log("users::update::error - " + JSON.stringify(err, null, 2));
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

  /**
   * @author Nguyễn Thế Sơn
   * Đã hoàn thành mapping
   * Chưa test lại
   */
  request.delete(api_mapping.delete_book.url + bookID, { json: true }, (err, response, data) => {
    if (err) {
      console.log("users::delete::error - " + JSON.stringify(err, null, 2));
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

    /**
     * @author Nguyễn Thế Sơn
     * Đã hoàn thành maping
     * Chưa test lại
     * 
     * TODO - Code chưa hoàn chỉnh - Phải map lại sau
     * var keySearch = event.queryStringParameters.keySearch;


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
     */
    request.get(pi_mapping.admin_search_book.url+"?keySearch="+keySearch, { json: true }, (err, response, data) => {
      if (err) {
        console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
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

  /**
   * @author Nguyễn Thế Sơn
   * Đã hoàn thành mapping
   * Chưa test lại
   */
  let options= {
    url:api_mapping.find_book_by_category.url + category,
    charset:"UTF-8"
  }
  console.log(api_mapping.find_book_by_category.url + category);
  request.get(api_mapping.find_book_by_category.url + encodeURI(category), { json: true }, (err, response, data) => {
    if (err) {
      console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      console.log("\nSố lượng tìm dc=" + data.Count);
      if (!req.session.cart) {
        return res.render("../views/site/page/list-book-cat.ejs", {
          products: [],
          allBooks: data.Items,
          totalPrice: 0,
          totalQty: 0
        });
      }
      //ngược lại đang trong phiên session
      var cart = new Cart(req.session.cart);
      res.render("../views/site/page/list-book-cat.ejs", {
        allBooks: data.Items,
        products: cart.generateArray(),
        totalPrice: cart.totalPrice,
        totalQty: cart.totalQty
      });
    }
  });
};

//TODO chưa map
exports.show_list_cat2 = function (req, res, next) {
  var dd = req.params.danhdau;
  console.log(dd);
  var params = {
    TableName: "DA2Book",
    FilterExpression: 'contains(#dd, :danhdau)',
    ExpressionAttributeValues: {
      ":danhdau": dd
    },
    ExpressionAttributeNames: {
      "#dd": "danhdau"
    }
  };

  docClient.scan(params, function (err, data) {
    if (err) {
      console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      console.log("\nSố lượng tìm dc=" + data.Count);
      if (!req.session.cart) {
        return res.render("site/page/list-book-cat", {
          products: [],
          allBooks: data.Items,
          totalPrice: 0,
          totalQty: 0
        });
      }
      //ngược lại đang trong phiên session
      var cart = new Cart(req.session.cart);
      res.render("site/page/list-book-cat", {
        allBooks: data.Items,
        products: cart.generateArray(),
        totalPrice: cart.totalPrice,
        totalQty: cart.totalQty
      });
    }
  });
};

exports.search_book = function (req, res, next) {
  var q = req.query.q;
  var cat = req.query.cat;

  q = renameModule.editName(q);

  //console.log(q);
  //console.log(cat);

  /**
   * @author Nguyễn Thế Sơn
   * Đã hoàn thành mapping theo code mới cập nhật 11/12
   * Chưa test lại
   */
  request.get(api_mapping.search_book.url+"?title="+q+"&category="+cat, { json: true }, (err, response, data) => {
    if (err) {
      console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      console.log("\nSố lượng tìm dc=" + data.Count);
      if (!req.session.cart) {
        return res.render("site/page/list-book-cat", {
          products: [],
          allBooks: data.Items,
          totalPrice: 0,
          totalQty: 0
        });
      }
      //ngược lại đang trong phiên session
      var cart = new Cart(req.session.cart);
      res.render("site/page/list-book-cat", {
        allBooks: data.Items,
        products: cart.generateArray(),
        totalPrice: cart.totalPrice,
        totalQty: cart.totalQty
      });
    }
  });
};

//GET ALL BOOK ADMIN
exports.get_all_book2 = function(req, res, next) {
  /**
   * @author N.T.Sơn
   * Kiểm tra session có timeout hay không? Nếu có thì redirect về trang login
   * Nếu bị redirect thì _headerSent là true và ngược lại.
   */
  authen_controller.check_session_auth(req, res);
  if (res._headerSent) return;

  /**
   * @author Nguyễn Thế Sơn
   * Đã hoàn thành mapping
   * Chưa test lại
   */
  request.get(api_mapping.admin_get_all_book.url, { json: true }, (err, response, data) => {
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
  });
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

  /**
   * @author Nguyễn Thế Sơn
   * Đã hoàn thành mapping
   * Chưa test lại
   */
  request.get(api_mapping.get_book_detail.url + sachID, { json: true }, (err, response, data) => {
    if (err) {
      console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
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
