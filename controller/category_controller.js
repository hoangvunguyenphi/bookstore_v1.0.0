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
    region,
    endpoint
});
let docClient = new AWS.DynamoDB.DocumentClient();

/**
 * @author Nguyễn Thế Sơn
 * Cập nhật module request
 */
let request = require('request');
let api_mapping = require('./api-mapping.json')

exports.get_all_category = function(req, res, next) {
    var params = {
        TableName: "DA2Category"
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
            res.render("../views/admin/page/list-category.ejs", {
                allCategory: data.Items
            });
        }
    }
};

exports.add_new_theloai = function(req, res) {
    var table = "DA2Category";
    var params = {
        TableName: table,
        Item: {
            _categoryID: UUID(),
            tentheloai: String(req.body.txtTenTheLoai).trim()
        }
    };
    docClient.put(params, function(err, data) {
        if (err) {
            console.log(
                "\nUnable to scan the table. Error JSON:",
                JSON.stringify(err, null, 2)
            );
        } else {
            res.redirect("/admin/category");
        }
    });
};

exports.delete_category = function(req, res) {
    var table = "DA2Category";
    var params = {
        TableName: table,
        Item: {
            _categoryID: UUID(),
            tentheloai: String(req.body.txtTenTheLoai).trim()
        }
    };
    docClient.put(params, function(err, data) {
        if (err) {
            console.log(
                "\nUnable to scan the table. Error JSON:",
                JSON.stringify(err, null, 2)
            );
        } else {
            res.redirect("/admin/category");
        }
    });
};
