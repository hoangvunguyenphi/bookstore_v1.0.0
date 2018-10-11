var AWS = require("aws-sdk");
var fs = require("fs");

AWS.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();
console.log("Importing users into DynamoDB. Please wait.");

var allCategorys = JSON.parse(fs.readFileSync("category_data.json", "utf8"));
allCategorys.forEach(function (cat) {
    var params = {
        TableName: "DA2Category",
        Item: {
            _categoryID: cat._categoryID,
            tentheloai: cat.tentheloai,
            hinhanh: cat.hinhanh
        }
    };

    docClient.put(params, function (err, data) {
        if (err) {
            console.error(
                "Unable to add book",
                cat._categoryID,
                ". Error JSON:",
                JSON.stringify(err, null, 2)
            );
        } else {
            console.log("Put User succeeded:", cat._categoryID);
        }
    });
});