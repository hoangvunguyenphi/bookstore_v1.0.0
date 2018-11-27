const AWS = require("aws-sdk");
const Cart = require("./cart");
var awsconfig = require("../../aws-config.json");
const accessKeyId = awsconfig.AWS.accessKeyId;
const secretAccessKey = awsconfig.AWS.secretAccessKey;
const region = awsconfig.AWS.region;
var endpoint = "http://localhost:8000";
AWS.config.update({
  accessKeyId,
  secretAccessKey,
  region
});
let docClient = new AWS.DynamoDB.DocumentClient();

//Module thêm vào shopping cart
exports.add_to_cart = function (req, res, next) {
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
  docClient.query(params, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      data.Items.forEach(function (it) {
        cart.add(it, it._bookID);
      });
      req.session.cart = cart;
      res.json({
        products: cart.generateArray(),
        totalPrice: cart.totalPrice,
        totalQty: cart.totalQty
      });
    }
  });
};

exports.add_to_cart2 = function (req, res, next) {
  var sachID = req.params.id;
  var soluong = Number(req.body.abasdjuwas);
  console.log("______sl:" + soluong);
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
  docClient.query(params, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      data.Items.forEach(function (it) {
        cart.add2(it, it._bookID, soluong);
      });
      req.session.cart = cart;
      res.json({
        products: cart.generateArray(),
        totalPrice: cart.totalPrice,
        totalQty: cart.totalQty
      });
    }
  });
};

//Module get các item trong cart
exports.get_items_cart = function (req, res, next) {
  if (!req.session.cart) {
    return res.render("../views/site/page/cart", {
      products: [],
      totalPrice: 0,
      totalQty: 0
    });
  }
  var cart = new Cart(req.session.cart);
  console.log(cart.generateArray())
  res.render("../views/site/page/cart", {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
    totalQty: cart.totalQty
  });
};
exports.update_cart = function (req, res, next) {
  if (!req.session.cart) {
    return res.render("../views/site/page/cart", {
      products: [],
      totalPrice: 0,
      totalQty: 0
    });
  }
  //var qty = req.body.qty;
  var cart = new Cart(req.session.cart);
  cart.generateArray().forEach(function (ct) {
    var nameqty = ct.item._bookID;
    var qtyItem = Number(req.body[nameqty]);
    cart.update(ct.item._bookID, qtyItem);
    req.session.cart = cart;
  });
  res.redirect("/cart");
};

exports.delete_cart_item = function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.removeItem(productId);
  req.session.cart = cart;
  res.json({
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
    totalQty: cart.totalQty
  });
};

exports.delete_cart_item2 = function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.removeItem(productId);
  req.session.cart = cart;
  return res.redirect("/cart");
};


//Module get các item trong cart
exports.check_out = function (req, res, next) {
  if (!req.session.cart || req.session.cart == null) {
    return res.render("../views/site/page/cart", {
      products: [],
      totalPrice: 0,
      totalQty: 0
    });
  }
  var cart = new Cart(req.session.cart);
  return res.render("../views/site/page/checkout", {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
    totalQty: cart.totalQty
  });
};