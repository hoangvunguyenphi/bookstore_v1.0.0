var AWS = require("aws-sdk");
var Cart = require("./cart");
let awsConfig = {
  region: "us-west-2",
  endpoint: "http://localhost:8000"
};
AWS.config.update(awsConfig);
let docClient = new AWS.DynamoDB.DocumentClient();

//Module thêm vào shopping cart
exports.add_to_cart = function(req, res, next) {
  var sachID = req.params.id;
  //kiểm tra session ,khởi tạo Cart,
  var cart = new Cart(req.session.cart ? req.session.cart : {});
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
  docClient.query(params, function(err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      data.Items.forEach(function(it) {
        console.log(it._bookID);
        cart.add(it, it._bookID);
      });
      req.session.cart = cart;
      console.log("cart" + cart);
      res.redirect("/");
    }
  });
};

//Module get các item trong cart
exports.get_items_cart = function(req, res, next) {
  if (!req.session.cart) {
    return res.render("../views/site/page/cart", {
      products: [],
      totalPrice: 0,
      totalQty: 0
    });
  }
  var cart = new Cart(req.session.cart);
  console.log(cart);
  res.render("../views/site/page/cart", {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
    totalQty: cart.totalQty
  });
};
exports.update_cart = function(req, res, next) {
  if (!req.session.cart) {
    return res.render("../views/site/page/cart", {
      products: [],
      totalPrice: 0,
      totalQty: 0
    });
  }
  //var qty = req.body.qty;
  var cart = new Cart(req.session.cart);
  cart.generateArray().forEach(function(ct) {
    var nameqty = ct.item._bookID;
    console.log("NAME__" + nameqty);
    var qtyItem = req.body[nameqty];
    console.log("BODY__" + qtyItem);
    cart.update(ct.item._bookID, qtyItem);
    req.session.cart = cart;
  });
  res.redirect("/cart");
};

exports.delete_cart_item = function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect("/cart");
};
