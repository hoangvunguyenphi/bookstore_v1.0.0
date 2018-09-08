var express = require("express");
var router = express.Router();
var Book_controller = require("../controller/book_controller");
var Cart_controller = require("../controller/cart_controller");
var Cart = require("../controller/cart");
var AWS = require("aws-sdk");

let awsConfig = {
  region: "us-west-2",
  endpoint: "http://localhost:8000"
};
AWS.config.update(awsConfig);
let docClient = new AWS.DynamoDB.DocumentClient();

/* GET home page. */
router.get("/", Book_controller.get_all_book);

router.get("/product/*_:id", Book_controller.get_detail_product);

router.get("/addtocart/:id", Cart_controller.add_to_cart);
// router.post("/addtocart", Cart_controller.add_to_cart);

router.get("/cart", Cart_controller.get_items_cart);

router.post("/updatecart", Cart_controller.update_cart);

router.get("/deletecart/:id", Cart_controller.delete_cart_item);

module.exports = router;
