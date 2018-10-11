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
    TableName: "DA2Order",
    KeySchema: [{
        AttributeName: "_orderID",
        KeyType: "HASH"
    }],
    AttributeDefinitions: [{
        AttributeName: "_orderID",
        AttributeType: "S"
    }],
    ProvisionedThroughput: {
        ReadCapacityUnits: 4,
        WriteCapacityUnits: 4
    }
};

dynamodb.createTable(params, function (err, data) {
    if (err) {
        console.error(
            "Unable to create table. Error JSON:",
            JSON.stringify(err, null, 2)
        );
    } else {
        console.log(
            "Created table DA2Book. Table description JSON:",
            JSON.stringify(data, null, 2)
        );
    }
});