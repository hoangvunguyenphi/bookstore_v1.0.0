var express = require("express");
var router = express.Router();
var Book_controller = require("../controller/book_controller");
let date = require("date-and-time");
var AWS = require("aws-sdk");
var renameModule = require("../controller/edit_name");

const UUID = require("uuid/v4");
var multer = require("multer");
var multerS3 = require("multer-s3");
var path = require("path");
let multipart = require("connect-multiparty");
let multipartMiddleware = multipart();

var awsconfig = require("../../aws-config.json");
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
//Admin index
router.get("/", Book_controller.get_all_book2);

router.get("/addNew", Book_controller.addNewBook);

//xemchi tiet
router.get("/detail/:id", Book_controller.get_detail_product2);

//Chỉnh sửa sp
router.post("/update/:id", Book_controller.edit_book);

//Xoá sp
router.get("/delete/:id", Book_controller.delete_book);

//Admin search book
router.post("/aSearchBook", Book_controller.admin_search_book);

var keyImgUpload = "";
var s3 = new AWS.S3();
var upload = multer({
  limits: {
    fileSize: 3 * 1024 * 1024
  },
  fileFilter: function(res, file, cb) {
    var filetypes = /jpeg|jpg|png|gif|bmp/;
    var mimetype = filetypes.test(file.mimetype);
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      "Error: File upload only supports the following filetypes - " +
        filetypes +
        "!! GO BACK !"
    );
  },
  storage: multerS3({
    s3: s3,
    bucket: "da2-book",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: function(req, file, cb) {
      keyImgUpload =
        renameModule.editName(req.body.newTieuDe) +
        "-" +
        UUID() +
        path.extname(file.originalname);
      cb(null, keyImgUpload);
    }
  })
});
router.post("/saveNewBook", upload.single("newImgUpload"), function(req, res) {
  var table = "DA2Book";
  var buket = "da2-book";
  var now = date.format(new Date(), "DD/MM/YYYY");
  var url =
    "https://" + buket + ".s3." + region + ".amazonaws.com/" + keyImgUpload;
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
  docClient.put(params, function(err, data) {
    if (err) {
      var params = {
        Bucket: buket,
        Delete: {
          Objects: [
            {
              Key: keyImgUpload
            }
          ]
        }
      };
      s3.deleteObjects(params, function(err, data) {
        if (err) console.log(err, err.stack);
        else {
          console.log(data);
          res.send(JSON.stringify(err));
        }
      });
    } else {
      res.redirect("/admin/product");
    }
  });
});

module.exports = router;
