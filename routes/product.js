var express = require("express");
var router = express.Router();
var Book_controller = require("../controller/book_controller");
let date = require("date-and-time");
var AWS = require("aws-sdk");
var renameModule = require("../controller/edit_name");
let authen_controller = require("../controller/authentication_controller");

const UUID = require("uuid/v4");
var multer = require("multer");
var multerS3 = require("multer-s3");
var path = require("path");
let multipart = require("connect-multiparty");
let multipartMiddleware = multipart();

var awsconfig = require("../aws-config.json");
const accessKeyId = awsconfig.AWS.accessKeyId;
const secretAccessKey = awsconfig.AWS.secretAccessKey;
var region = awsconfig.AWS.region;
var endpoint = "http://localhost:8000";
AWS.config.update({
    accessKeyId,
    secretAccessKey,
    region
});
let docClient = new AWS.DynamoDB.DocumentClient();
//Admin index
router.get("/", Book_controller.get_all_book2);

router.get("/addNew", function(req, res) {
    /**
     * @author N.T.Sơn
     * Kiểm tra session có timeout hay không? Nếu có thì redirect về trang login
     */
    // authen_controller.check_session_auth(req, res);

    res.render("../views/admin/page/addNewBook.ejs");
});

//xemchi tiet
router.get("/detail/:id", Book_controller.get_detail_product2);

//Xoá sp
router.get("/delete/:id", Book_controller.delete_book);

//Admin search book
router.post("/aSearchBook", Book_controller.admin_search_book);

var s3 = new AWS.S3();
var keyImgUpload = [];

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "da2book",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: "public-read",
        key: function(req, file, callback) {
            var keyImg =
                renameModule.editName(req.body.newTieuDe) +
                "-" +
                UUID() +
                path.extname(file.originalname);
            keyImgUpload.push(keyImg);
            console.log(keyImg);
            callback(null, keyImg);
        }
    })
});

//Chỉnh sửa sp
router.post("/update/:id", upload.array("newImgUpload", 10), function(
    req,
    res
) {
    var table = "DA2Book";
    var buket = "da2book";
    var now = date.format(new Date(), "DD/MM/YYYY HH:mm:ss");

    var listImgDelete = renameModule.splitList(req.body.imageDelete);
    if (listImgDelete[0] == "") {
        listImgDelete = [];
    }
    var listImg = [];
    var bookid = req.params.id;
    console.log("listdelete", listImgDelete);

    var params = {
        TableName: table,
        KeyConditionExpression: "#ma = :id",
        ExpressionAttributeNames: {
            "#ma": "_bookID"
        },
        ExpressionAttributeValues: {
            ":id": bookid
        }
    };

    docClient.query(params, function(err, data) {
        if (err) {
            console.log(
                "Unable to query. Error:",
                JSON.stringify(err, null, 2)
            );
        } else {
            console.log(data.Items[0].hinhanh);
            var listImg = data.Items[0].hinhanh || [];
            console.log("kêy upload", keyImgUpload);
            if (keyImgUpload != []) {
                for (var i = 0; i < keyImgUpload.length; i++) {
                    keyImgUpload[i] =
                        "https://" +
                        buket +
                        ".s3." +
                        region +
                        ".amazonaws.com/" +
                        keyImgUpload[i];
                }
            }
            listImg = listImg.concat(keyImgUpload);
            keyImgUpload = [];
            console.log("sau khi them file", listImg);
            if (listImgDelete != []) {
                listImgDelete.forEach(function(lid) {
                    listImg.forEach(function(li) {
                        var indexHinh = listImg.indexOf(lid);
                        if (indexHinh > -1) {
                            listImg.splice(indexHinh, 1);
                        }
                    });
                });
                console.log("sau khi xoá bớt file", listImg);
            }

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
                gia: parseFloat(req.body.newGia),
                hinhanh: listImg
            };
            console.log(editBook);

            var params2 = {
                TableName: "DA2Book",
                Key: {
                    _bookID: bookid
                },
                UpdateExpression:
                    "set #sku=:sk, #tieude=:td, #tacgia=:tg, #dichgia=:dg, #theloai=:tl,#tinhtrang=:tt,#ngonngu=:nn,#ngayxuatban=:txb,#nhaxuatban=:nxb,#sotrang=:st,#mota=:mt,#danhdau=:dd,#gia=:g,#hinhanh=:haa",
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
                    ":g": editBook.gia,
                    ":haa": editBook.hinhanh
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
                    "#gia": "gia",
                    "#hinhanh": "hinhanh"
                },
                ReturnValues: "UPDATED_NEW"
            };
            docClient.update(params2, function(err, data) {
                if (err) {
                    console.log(
                        "users::update::error - " + JSON.stringify(err, null, 2)
                    );
                } else {
                    // console.log("users::update::success " + JSON.stringify(data));
                    res.redirect("/admin/product/detail/" + bookid);
                }
            });
        }
    });
});

router.post("/saveNewBook", upload.array("newImgUpload", 10), function(
    req,
    res
) {
    /**
     * @author N.T.Sơn
     * Kiểm tra session có timeout hay không? Nếu có thì redirect về trang login
     */
    // authen_controller.check_session_auth(req, res);

    var table = "DA2Book";
    var buket = "da2book";
    var now = date.format(new Date(), "DD/MM/YYYY HH:mm:ss");
    for (var i = 0; i < keyImgUpload.length; i++) {
        keyImgUpload[i] =
            "https://" +
            buket +
            ".s3." +
            region +
            ".amazonaws.com/" +
            keyImgUpload[i];
    }
    var params = {
        TableName: table,
        Item: {
            _bookID: UUID(),
            tieude: String(req.body.newTieuDe).trim(),
            theloai: req.body.newTheLoai,
            tacgia: renameModule.splitList(String(req.body.newTacGia)),
            sotrang: Number(req.body.newSoTrang),
            SKU: String(req.body.newSKU).trim(),
            ngayxuatban: req.body.newNgayXuatBan,
            nhaxuatban: String(req.body.newNhaXuatBan).trim(),
            kichthuoc: req.body.newKichThuoc || [],
            mota: req.body.newMoTa,
            ngonngu: String(req.body.newNgonNgu).trim(),
            dichgia:
                renameModule.splitList(String(req.body.newDichGia).trim()) ||
                [],
            tinhtrang: ["còn hàng"],
            ngaythem: now,
            danhdau:
                renameModule.splitList(String(req.body.newDanhDau).trim()) ||
                [],
            linkseo: renameModule.editName(String(req.body.newTieuDe).trim()),
            gia: parseFloat(String(req.body.newGia).trim()),
            hinhanh: keyImgUpload
        }
    };
    keyImgUpload = [];
    console.log(params);
    docClient.put(params, function(err, data) {
        if (err) {
            keyImgUpload.forEach(function(ky) {
                var params = {
                    Bucket: buket,
                    Delete: {
                        Objects: [
                            {
                                Key: ky
                            }
                        ]
                    }
                };
                s3.deleteObjects(params, function(err, data) {
                    if (err) console.log(err, err.stack);
                    else {
                        console.log(data);
                    }
                });
            });
            console.log("ERROR, Đã xoá hết file uploaded");
            res.send(JSON.stringify(err));
        } else {
            res.redirect("/admin/product");
        }
    });
});

module.exports = router;
