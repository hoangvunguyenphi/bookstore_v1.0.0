var AWS = require("aws-sdk");

var Cart = require("./cart");
let awsConfig = {
  region: "us-west-2",
  endpoint: "http://localhost:8000"
};
AWS.config.update(awsConfig);
let docClient = new AWS.DynamoDB.DocumentClient();

//GET ALL BOOK
exports.get_all_book = function(req, res, next) {
  var params = {
    TableName: "DA2Book"
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
      data.Items.forEach(function(book) {
        console.log("INITIAL=" + book._bookID);
      });
      //nếu session rỗng
      if (!req.session.cart) {
        return res.render("../views/site/page/home", {
          products: [],
          allBooks: data.Items,
          totalPrice: 0,
          totalQty: 0
        });
      }
      //ngược lại đang trong phiên session
      var cart = new Cart(req.session.cart);
      cart.generateArray().forEach(function(c) {
        console.log(
          "cart_genera=" +
            c.item._bookID +
            "\nQty=" +
            c.qty +
            "\nPrice=" +
            c.price
        );
      });
      res.render("../views/site/page/home", {
        allBooks: data.Items,
        products: cart.generateArray(),
        totalPrice: cart.totalPrice,
        totalQty: cart.totalQty
      });
    }
  }
};

//GET CHI TIET SP
exports.get_detail_product = function(req, res, next) {
  var sachID = req.params.id;
  console.log("\n_________" + sachID);

  var params = {
    TableName: "DA2Book",
    KeyConditionExpression: "#ma = :id",
    ExpressionAttributeNames: {
      "#ma": "_bookID"
    },
    ExpressionAttributeValues: {
      ":id": sachID
    }
  };
  //Thực hiện query object theo id lấy từ req.params
  docClient.query(params, function(err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      console.log("Query succeeded.");
      if (!req.session.cart) {
        return res.render("../views/site/page/single-product", {
          products: [],
          allBooks: data.Items,
          totalPrice: 0,
          totalQty: 0
        });
      }
      var cart = new Cart(req.session.cart);
      res.render("../views/site/page/single-product", {
        sachDetail: data.Items,
        products: cart.generateArray(),
        totalPrice: cart.totalPrice,
        totalQty: cart.totalQty
      });
    }
  });
};
