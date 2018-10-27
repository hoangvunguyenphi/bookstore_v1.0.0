var AWS = require("aws-sdk");
const awsconfig = require('../../../../aws-config.json');
const accessKeyId = awsconfig.AWS.accessKeyId;
const secretAccessKey = awsconfig.AWS.secretAccessKey;
const region = awsconfig.AWS.region;
var endpoint = "http://localhost:8000"
AWS.config.update({
  accessKeyId,
  secretAccessKey,
  endpoint,
  region
});
var dynamodb = new AWS.DynamoDB();

var params = {
  TableName: "DA2Book",
  KeySchema: [{
    AttributeName: "_bookID",
    KeyType: "HASH"
  }],
  AttributeDefinitions: [{
    AttributeName: "_bookID",
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