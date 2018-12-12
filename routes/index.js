var express = require("express");
var router = express.Router();
var Order_controller = require("../controller/order_controller");
var Book_controller = require("../controller/book_controller");
var Cart_controller = require("../controller/cart_controller");
var editName = require("../controller/edit_name");
//Trang chủ
router.get("/", Book_controller.get_all_book);

//Chi tiết sp
router.get("/product/*_:id", Book_controller.get_detail_product);

//Thêm vào giỏ hàng với sl=1
router.get("/addtocart/:id", Cart_controller.add_to_cart);
// router.post("/addtocart", Cart_controller.add_to_cart);

//Thêm sản phẩm vào giỏ khi ở trang chi tiết sp với số lượng nhập vào
router.post("/product/*_:id", Cart_controller.add_to_cart2);

//Đi đến đặt hàng
router.get("/check_out", Cart_controller.check_out);

//Xử lý đặt hàng= thêm order, gửi mail xác nhận
router.post("/addOrder", Order_controller.add_order);

//Xác nhận order = OTP code
router.get("/xacNhanOrder/:codeDef", Order_controller.xacNhanOrder);

//xem sp theo thể loại
router.get("/product/:theloai", Book_controller.show_list_cat);

//xem sp theo đánh dấu
router.get("/dd/:danhdau", Book_controller.show_list_cat2);
//Tìm kiếm sp
router.get("/csearch_book", Book_controller.search_book);

//Xem giỏ hàng
router.get("/cart", Cart_controller.get_items_cart);

//Update số lượng sp trong giỏ
router.post("/updatecart", Cart_controller.update_cart);

//Xoá sp trong giỏ menu
router.get("/deletecart/:id", Cart_controller.delete_cart_item);

//Xoá sp trong giỏ
router.get("/deletecart2/:id", Cart_controller.delete_cart_item2);

//khách hàng kiểm tra thông tin đơn hàng
router.get("/trackOrder", Order_controller.trackOrder);

//tìm kiếm đơn hàng trackorder
router.post("/trackOrder", Order_controller.searchOrder);
//router.get("*", Cart_controller.handleError1 );

router.get("/trackOrder/:id/:mail", Order_controller.getOrderTrack);

router.get("/getAllTinhTP", editName.getAllTinhTP);

router.get("/getAllHuyenByTinhID/:id", editName.getAllHuyenByTinhID);

router.get("/getAllXaByHuyenID/:id", editName.getAllXaByHuyenID);

module.exports = router;
