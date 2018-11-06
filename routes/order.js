var express = require("express");
var router = express.Router();
var OrderController = require('../controller/order_controller');
router.get("/", OrderController.getAllOrder);
router.get("/detail/:id", OrderController.getDetailOrder);

module.exports = router;