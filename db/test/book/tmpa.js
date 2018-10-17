var AWS = require("aws-sdk");
const awsconfig = require('../../../../aws-config.json');
var accessKeyId = awsconfig.AWS.accessKeyId;
var secretAccessKey = awsconfig.AWS.secretAccessKey;
var region = awsconfig.AWS.region;
var endpoint = "http://localhost:8000";
AWS.config.update({
    accessKeyId,
    secretAccessKey,
    endpoint,
    region
});
let docClient = new AWS.DynamoDB.DocumentClient();
const perf = require('execution-time')();

var aa = ['hot', 'sale', 'new', 'popular'];
var params1 = {
    TableName: "DA2Book",
    FilterExpression: "contains(#danhdau, :dd)",
    ExpressionAttributeNames: {
        "#danhdau": "danhdau"
    },
    ExpressionAttributeValues: {
        ":dd": aa[4]
    }
};

docClient.scan(params1, onScan1)

function onScan1(err, data) {
    perf.start();
    if (err) {
        console.log(
            "\nUnable to scan the table. Error JSON:",
            JSON.stringify(err, null, 2)
        );
    } else {
        console.log("BOOK-COUNT=" + data.Count);
        const results = perf.stop();
        console.log(results.time);
    }
}


// var fs = require('fs');
// var http = require('http');

// var alltmp = JSON.parse(fs.readFileSync('./tmp.json', 'utf8'));
// var i = 0;
// alltmp.forEach(function (temp) {
//     i += 1;
// });
// console.log(i);


// var fs = require('fs');
// var editname = require('./bc');
// var download = require('download-file')

// var alltmp = JSON.parse(fs.readFileSync('./tmp.json', 'utf8'));
// alltmp.forEach(function (temp) {
//     temp.hinhanh.forEach(function (va) {
//         var filename = editname.editName(va.substring(va.lastIndexOf('/') + 1, va.lastIndexOf('.'))) + va.substring(va.lastIndexOf('.'));
//         console.log(filename);
//         var options = {
//             directory: "./public/images",
//             filename: filename
//         }
//         download(va, options, function (err) {
//             if (err) throw err
//             console.log("Downloadding file:" + va);
//         })
//     })
// });

// var alltmp = JSON.parse(fs.readFileSync('./tmp.json', 'utf8'));
// var allEditTmp = [];
// alltmp.forEach(function (temp) {
//     var hinh = [];
//     temp.hinhanh.forEach(function (va) {
//         var filename = "https://s3-us-west-2.amazonaws.com/da2-book/" + editname.editName(va.substring(va.lastIndexOf('/') + 1, va.lastIndexOf('.'))) + va.substring(va.lastIndexOf('.'));
//         //console.log(filename);
//         hinh.push(filename);
//         // var options = {
//         //     directory: "./public/images",
//         //     filename: filename
//         // }
//         // download(va, options, function (err) {
//         //     if (err) throw err
//         //     console.log("Downloadding file:" + va);
//         // })
//     });
//     // console.log(hinh);
//     temp.hinhanh = hinh;
//     allEditTmp.push(temp);
// });
// console.log(allEditTmp);
// fs.writeFileSync('editData.json', JSON.stringify(allEditTmp, null, 2));