var sio = require('socket.io');
var io = null;
var Order_controller = require("../controller/order_controller");
exports.init = function (server) {
    io = sio(server);
    io.on('connection', function (socket) {
        socket.on('updateCart', function (data) {
            Order_controller.updateCartItem(data);
        });
    });
}