var AWS = require("aws-sdk");

const awsconfig = require('../../../../aws-config.json');
const accessKeyId = awsconfig.AWS.accessKeyId;
const secretAccessKey = awsconfig.AWS.secretAccessKey;
const region = awsconfig.AWS.region;
var endpoint = "http://localhost:8000";
AWS.config.update({
    accessKeyId,
    secretAccessKey,
    endpoint,
    region
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