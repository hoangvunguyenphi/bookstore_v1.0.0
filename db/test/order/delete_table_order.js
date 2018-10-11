var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2",
    // endpoint: "http://localhost:8000",
    "accessKeyId": "AKIAJFRGV5MEQS4DR77Q",
    "secretAccessKey": "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",
    "region": "us-west-2"
});

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName: "DA2Order"
};

dynamodb.deleteTable(params, function (err, data) {
    if (err) {
        console.error(
            "Unable to delete table. Error JSON:",
            JSON.stringify(err, null, 2)
        );
    } else {
        console.log(
            "Deleted table. Table description JSON:",
            JSON.stringify(data, null, 2)
        );
    }
});