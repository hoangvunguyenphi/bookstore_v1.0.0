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
var docClient = new AWS.DynamoDB.DocumentClient();
var params = {
    TableName: "DA2Book"
};
//DUYET TAT CA COLLECTIONS TREN TABLE
docClient.scan(params, function (err, data) {
    if (err) {
        console.error(
            "\nUnable to scan the table. Error JSON:",
            JSON.stringify(err, null, 2)
        );
        res.render("error");
    } else {
        console.log(data);
    }
});
// var getUser = function (callback) {
//     var docClient = new AWS.DynamoDB.DocumentClient();
//     var params = {
//         TableName: "DA2Book"
//         //,
//         // KeyConditionExpression: "#id = :id",
//         // ExpressionAttributeNames: {
//         //     "#email": "email"
//         // },
//         // ExpressionAttributeValues: {
//         //     ":email": email
//         // }
//     };
//     docClient.scan(params, callback);
//  };
// console.log(getUser(callback));