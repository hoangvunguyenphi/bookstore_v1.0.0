var express = require("express");
var router = express.Router();
var app = express();
var Order_controller = require("../controller/order_controller");
var Book_controller = require("../controller/book_controller");
var Cart_controller = require("../controller/cart_controller");
var Cart = require("../controller/cart");
let date = require("date-and-time");
var AWS = require("aws-sdk");
var renameModule = require("../controller/edit_name");
// var upload_controller = require("../controller/upload_controller")

const UUID = require("uuid/v4");
var multer = require("multer");
var multerS3 = require("multer-s3");
var path = require("path");

var awsconfig = require('../../aws-config.json');
const accessKeyId = awsconfig.AWS.accessKeyId;
const secretAccessKey = awsconfig.AWS.secretAccessKey;
var region = awsconfig.AWS.region;
var endpoint = "http://localhost:8000";
AWS.config.update({
  accessKeyId,
  secretAccessKey,
  endpoint,
  region
});
let docClient = new AWS.DynamoDB.DocumentClient();

//Trang chủ
router.get("/", Book_controller.get_all_book);

//Chi tiết sp
router.get("/product/*_:id", Book_controller.get_detail_product);

//Thêm vào giỏ hàng với sl=1
router.get("/addtocart/:id", Cart_controller.add_to_cart);
// router.post("/addtocart", Cart_controller.add_to_cart);

//Thêm sản phẩm vào giỏ khi ở trang chi tiết sp với số lượng nhập vào
router.post("/add_detail_to_cart/:id", Cart_controller.add_to_cart2);

//Đi đến đặt hàng
router.get("/check_out", Cart_controller.check_out)

//Xử lý đặt hàng= thêm order, gửi mail xác nhận
router.post("/addOrder", Order_controller.add_order);

//Xác nhận order = OTP code 
router.get("/xacNhanOrder/:codeDef", Order_controller.xacNhanOrder);

//xem sp theo thể loại
router.get("/showlist_:theloai", Book_controller.show_list_cat)

//Tìm kiếm sp
router.post("/csearch_book", Book_controller.search_book);

//Xem giỏ hàng
router.get("/cart", Cart_controller.get_items_cart);

//Update số lượng sp trong giỏ
router.post("/updatecart", Cart_controller.update_cart);

//Xoá sp trong giỏ
router.get("/deletecart/:id", Cart_controller.delete_cart_item);

//ADMIN
////////////////////////////////////////////////////////////////////////////////////////

//Admin index
router.get("/admin", Book_controller.get_all_book2);

router.get("/viewBookDetail_:id", Book_controller.get_detail_product2)
//Chỉnh sửa sp
router.post("/admin/editBook/:id", Book_controller.edit_book);


//Xoá sp
router.get("/deleteBook/:id", Book_controller.delete_book)

//Admin search book
router.post("/aSearchBook", Book_controller.admin_search_book);

var keyImgUpload = "";
var s3 = new AWS.S3();
var upload = multer({
  limits: {
    fileSize: 3 * 1024 * 1024
  },
  fileFilter: function (res, file, cb) {
    var filetypes = /jpeg|jpg|png|gif|bmp/;
    var mimetype = filetypes.test(file.mimetype);
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      "Error: File upload only supports the following filetypes - " + filetypes + "!! GO BACK !"
    );
  },
  storage: multerS3({
    s3: s3,
    bucket: "da2-book",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: function (req, file, cb) {
      keyImgUpload = renameModule.editName(req.body.newTieuDe) + "-" + UUID() + path.extname(file.originalname);
      cb(null, keyImgUpload);
    }
  })
});
router.post("/addNewBook", upload.single("newImgUpload"),
  function (req, res, next) {
    var table = "DA2Book";
    var buket = "da2-book";
    var now = date.format(new Date(), "DD/MM/YYYY");
    var url =
      "https://" + buket + ".s3." + region + ".amazonaws.com/" + keyImgUpload;
    console.log("AAAA=" + req.body.newImgUpload);
    var params = {
      TableName: table,
      Item: {
        _bookID: UUID(),
        tieude: String(req.body.newTieuDe).trim(),
        theloai: String(req.body.newTheLoai),
        tacgia: renameModule.splitList(String(req.body.newTacGia)),
        sotrang: parseInt(String(req.body.newSoTrang).trim()),
        SKU: String(req.body.newSKU).trim(),
        ngayxuatban: String(req.body.newNgayXuatBan).trim(),
        nhaxuatban: String(req.body.newNhaXuatBan).trim(),
        kichthuoc: String(req.body.newKichThuoc).trim() || [],
        mota: String(req.body.newMoTa).trim(),
        ngonngu: String(req.body.newNgonNgu).trim(),
        dichgia: renameModule.splitList(String(req.body.newDichGia).trim()) || [],
        tinhtrang: " ",
        ngaythem: now,
        danhdau: renameModule.splitList(String(req.body.newDanhDau).trim()) || [],
        linkseo: renameModule.editName(String(req.body.newTieuDe).trim()),
        gia: parseFloat(String(req.body.newGia).trim()),
        hinhanh: renameModule.splitList(url)
      }
    };
    console.log(params);
    docClient.put(params, function (err, data) {
      if (err) {
        var params = {
          Bucket: buket,
          Delete: {
            Objects: [{
              Key: keyImgUpload
            }],
          },
        };
        s3.deleteObjects(params, function (err, data) {
          if (err) console.log(err, err.stack);
          else {
            console.log(data);
            res.send(JSON.stringify(err));
          }
        });
      } else {
        res.redirect("/admin");
      }
    });
  });

module.exports = router;