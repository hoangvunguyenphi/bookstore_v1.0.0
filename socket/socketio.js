var sio = require("socket.io");
var io = null;
var thongBao = [];
exports.init = function(server) {
    io = sio(server);
    io.on("connection", function(socket) {
        console.log("Co nguoi ket noi:", socket.id);
        socket.on("Client-Thong-Bao", function(data) {
            io.sockets.emit("thongBao", thongBao);
        });
        socket.on("disconnect", function() {
            console.log(socket.id + "ngat ket noi");
        });
    });
};
exports.thongBao = function(noiDung) {
    thongBao.push(noiDung);
};
exports.xoaThongBao = function(noiDung) {
    var indexNotifi = thongBao.indexOf(noiDung);
    if (indexNotifi > -1) {
        thongBao.splice(indexNotifi, 1);
    }
};
