var AWS = require("aws-sdk");
var fs = require("fs");
var awsconfig = require("../../../../aws-config.json");
var accessKeyId = awsconfig.AWS.accessKeyId;
var secretAccessKey = awsconfig.AWS.secretAccessKey;
var region = awsconfig.AWS.region;
var endpoint = "http://localhost:8000";
AWS.config.update({
    accessKeyId,
    secretAccessKey,
    region
});

var docClient = new AWS.DynamoDB.DocumentClient();
console.log("Importing users into DynamoDB. Please wait.");

var allCategorys = JSON.parse(fs.readFileSync("category_data.json", "utf8"));
allCategorys.forEach(function(cat) {
    var params = {
        TableName: "DA2Category",
        Item: {
            _categoryID: cat._categoryID,
            tentheloai: cat.tentheloai
        }
    };

    docClient.put(params, function(err, data) {
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
