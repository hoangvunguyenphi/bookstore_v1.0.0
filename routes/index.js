var express = require("express");
var server = require('http').Server(express);
var io = require('socket.io')(server);
var router = express.Router();

var Order_controller = require("../controller/order_controller");
var Book_controller = require("../controller/book_controller");

//Trang chủ
router.get("/", Book_controller.get_all_book);
// router.get("/", function (req, res) {
//     Book_controller.get_all_book(function (data) {
//         console.log(data)
//         if (!req.session.cart) {
//             return res.render("../views/site/page/index", {
//                 products: [], //cartItem
//                 allBooks: data.data.Items,
//                 totalPrice: 0,
//                 totalQty: 0
//             });
//         }
//         //ngược lại đang trong phiên session
//         var cart = new Cart(req.session.cart);
//         res.render("../views/site/page/index", {
//             products: cart.generateArray(),
//             allBooks: data.data.Items,
//             totalPrice: cart.totalPrice,
//             totalQty: cart.totalQty
//         });
//     });
// });

//Chi tiết sp
router.get("/product/*_:id", Book_controller.get_detail_product);

// //Thêm sản phẩm vào giỏ khi ở trang chi tiết sp với số lượng nhập vào
// router.post("/add_detail_to_cart/:id", Cart_controller.add_to_cart2);

router.get("/check_out", Order_controller.check_out)

//Xử lý đặt hàng= thêm order, gửi mail xác nhận
router.post("/addOrder", Order_controller.add_order);

//Xác nhận order = OTP code
router.get("/xacNhanOrder/:codeDef", Order_controller.xacNhanOrder);

//xem sp theo thể loại
router.get("/product/:theloai", Book_controller.show_list_cat);

//Tìm kiếm sp
router.post("/csearch_book", Book_controller.search_book);

module.exports = router;