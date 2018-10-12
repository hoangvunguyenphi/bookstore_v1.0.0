var AWS = require("aws-sdk");
var fs = require("fs");
const awsconfig = require('../../../aws-config.json');
const accessKeyId = awsconfig.AWS.accessKeyId;
const secretAccessKey = awsconfig.AWS.secretAccessKey;
const region = awsconfig.AWS.region;
AWS.config.update({
  accessKeyId,
  secretAccessKey,
  region
});

var docClient = new AWS.DynamoDB.DocumentClient();
console.log("Importing users into DynamoDB. Please wait.");

var allBooks = JSON.parse(fs.readFileSync("book_data.json", "utf8"));
allBooks.forEach(function (book) {
  var params = {
    TableName: "DA2Book",
    Item: {
      _bookID: book._bookID,
      tacgia: book.tacgia,
      tieude: book.tieude,
      theloai: book.theloai,
      sotrang: book.sotrang,
      SKU: book.SKU,
      ngayxuatban: book.ngayxuatban,
      nhaxuatban: book.nhaxuatban,
      kichthuoc: book.kichthuoc,
      mota: book.mota,
      dichgia: book.dichgia,
      ngonngu: book.ngonngu,
      tinhtrang: book.tinhtrang,
      ngaythem: book.ngaythem,
      danhdau: book.danhdau,
      linkseo: book.linkseo,
      gia: book.gia,
      hinhanh: book.hinhanh
    }
  };

  docClient.put(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to add book",
        book._bookID,
        ". Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log("Put User succeeded:", book._bookID);
    }
  });
});