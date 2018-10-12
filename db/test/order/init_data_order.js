var AWS = require("aws-sdk");
var fs = require("fs");
const awsconfig = require('../../../aws-config.json');
const accessKeyId = awsconfig.AWS.accessKeyId;
const secretAccessKey = awsconfig.AWS.secretAccessKey;
const region = awsconfig.AWS.region;
AWS.config.update({
    accessKeyId,
    secretAccessKey,
    region
});

var docClient = new AWS.DynamoDB.DocumentClient();
console.log("Importing users into DynamoDB. Please wait.");

var allOrders = JSON.parse(fs.readFileSync("order_data.json", "utf8"));
allOrders.forEach(function (order) {
    var params = {
        TableName: "DA2Order",
        Item: {
            _orderID: order._orderID,
            ngaylaphoadon: order.ngaylaphoadon,
            tennguoinhan: order.tennguoinhan,
            sodienthoai: order.sodienthoai,
            email: order.email,
            diachi: order.diachi,
            ghichu: order.ghichu,
            tienship: order.tienship,
            items: order.items,
            tongtienthanhtoan: order.tongtienthanhtoan,
            tinhtrang: order.tinhtrang,
            ngaythanhtoan: order.ngaythanhtoan
        }
    };

    docClient.put(params, function (err, data) {
        if (err) {
            console.error(
                "Unable to add book",
                order._orderID,
                ". Error JSON:",
                JSON.stringify(err, null, 2)
            );
        } else {
            console.log("Put User succeeded:", order._orderID);
        }
    });
});