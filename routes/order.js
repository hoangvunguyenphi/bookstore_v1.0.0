var express = require("express");
var router = express.Router();
var OrderController = require("../controller/order_controller");
//admin/order
router.get("/", OrderController.getAllOrder);

//admin/new hiển thị danh sách order mới cần duyệt
router.get("/new", OrderController.getNewOrders);

//admin/new hiển thị danh sách order bị từ chối
router.get("/reject", OrderController.getRejectOrders);

//admin/new hiển thị danh sách order chưa xác thực
router.get("/unauthent", OrderController.getUnAuthenOrders);

//admin/detail/:id hiển thị chi tiết order, cập nhật thông tin order 
router.get("/detail/:id", OrderController.getDetailOrder);

//admin/confirmOrderDetail/:id hiển thị chi tiết order mới, chấp nhận order hoặc từ chối order
router.get("/confirmOrderDetail/:id", OrderController.getDetailOrderNew);

//admin/rejectOrder/:id từ chối order, set tình trạng là từ chối
router.post("/rejectOrder/:id", OrderController.rejectOrder);

//admin/confirmOrder/:id chấp nhận order, set tình trạng là đã chấp nhận và đóng gói 
router.get("/confirmOrder/:id", OrderController.confirmOrder);

//admin/update/id cập nhật thông tin và tình trạng order
router.post("/update/:id", OrderController.update_order);

//admin/update/id cập nhật thông tin và tình trạng order
router.post("/updatetinhtrang/:id", OrderController.update_tinhtrang_order);



module.exports = router;
