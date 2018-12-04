var express = require("express");
var router = express.Router();
let date = require("date-and-time");
var AWS = require("aws-sdk");
var renameModule = require("../controller/edit_name");
let authen_controller = require("../controller/authentication_controller");

const UUID = require("uuid/v4");
var multer = require("multer");
var multerS3 = require("multer-s3");
var path = require("path");
var CategoryController = require("../controller/category_controller");
var awsconfig = require("../../aws-config.json");
var accessKeyId = awsconfig.AWS.accessKeyId;
var secretAccessKey = awsconfig.AWS.secretAccessKey;
var region = awsconfig.AWS.region;
AWS.config.update({
    accessKeyId,
    secretAccessKey,
    region
});
let docClient = new AWS.DynamoDB.DocumentClient();

//admin/category hiển thị danh sách category
router.get("/", CategoryController.get_all_category);

router.post("/addNew", CategoryController.add_new_theloai);

module.exports = router;
