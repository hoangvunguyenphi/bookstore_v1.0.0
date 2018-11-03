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