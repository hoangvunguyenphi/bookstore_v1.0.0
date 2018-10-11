var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:8000"
});

var dynamodb = new AWS.DynamoDB();

var params = {
  TableName: "DA2Book",
  KeySchema: [{ AttributeName: "_bookID", KeyType: "HASH" }],
  AttributeDefinitions: [{ AttributeName: "_bookID", AttributeType: "S" }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 4,
    WriteCapacityUnits: 4
  }
};

dynamodb.createTable(params, function(err, data) {
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
