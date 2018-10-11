var AWS = require("aws-sdk");
var region = "us-west-2";
let awsConfig = {
    region: region,
    // endpoint: "http://localhost:8000",
    "accessKeyId": "AKIAJFRGV5MEQS4DR77Q",
    "secretAccessKey": "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",
    "region": "us-west-2"
};
AWS.config.update(awsConfig);
let docClient = new AWS.DynamoDB.DocumentClient();
var params = {
    TableName: "DA2Order"
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
        data.Items.forEach(function (a) {
            console.log(a);
        })
    }
}