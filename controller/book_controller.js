var AWS = require("aws-sdk");
//var upload_controller = require("../controller/upload_controller")
var Cart = require("./cart");
const UUID = require("uuid/v4");
let date = require("date-and-time");
var renameModule = require("../controller/edit_name");
var region = "us-west-2";
let awsConfig = {
  region: region,
  endpoint:"http://localhost:8000"
};
AWS.config.update(awsConfig);
let docClient = new AWS.DynamoDB.DocumentClient();

//GET ALL BOOK
exports.get_all_book = function (req, res, next) {
  var params = {
    TableName: "DA2Book"
  };
  //DUYET TAT CA COLLECTIONS TREN TABLE
  docClient.scan(params, onScan);

  function onScan(err, data) {
    if (err) {
      console.error(
        "\nUnable to scan the table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.render("error");
    } else {
      data.Items.forEach(function (book) {
        console.log("INITIAL=" + book._bookID);
      });
      //nếu session rỗng
      if (!req.session.cart) {
        return res.render("../views/site/page/home", {
          products: [],
          allBooks: data.Items,
          totalPrice: 0,
          totalQty: 0
        });
      }
      //ngược lại đang trong phiên session
      var cart = new Cart(req.session.cart);
      res.render("../views/site/page/home", {
        allBooks: data.Items,
        products: cart.generateArray(),
        totalPrice: cart.totalPrice,
        totalQty: cart.totalQty
      });
    }
  }
};
//GET ALL BOOK ADMIN
exports.get_all_book2 = function (req, res, next) {
  var params = {
    TableName: "DA2Book"
  };
  docClient.scan(params, onScan);

  function onScan(err, data) {
    if (err) {
      console.error(
        "\nUnable to scan the table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.render("error");
    } else {
      res.render("../views/admin/page/ahome.ejs", {
        allBooks: data.Items
      });
    }
  }
};

//GET CHI TIET SP
exports.get_detail_product = function (req, res, next) {
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
  docClient.query(params, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {

      console.log(data);
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
        products: cart.generateArray(),
        totalPrice: cart.totalPrice,
        totalQty: cart.totalQty
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