var express = require("express");
var router = express.Router();
var Order_controller = require("../controller/order_controller");
var Book_controller = require("../controller/book_controller");
var authen_controller = require("../controller/authentication_controller");
/**
 * @author Nguyễn Thế Sơn
 * Cập nhật chức năng đăng nhập admin
 */
let fs = require("fs");
let AmazonCognitoIdentity = require("amazon-cognito-identity-js");
let CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
let jwk = require("../jwk.json");
let jose = require("node-jose");

const cognitoConfig = {
    UserPoolId: "us-west-2_s08A4vVxz",
    ClientId: "7kg7ksnpekn5q63dbdqfbqfkcn"
};

let poolData = {
    UserPoolId: cognitoConfig.UserPoolId, // Your user pool id here
    ClientId: cognitoConfig.ClientId // Your client id here
};
router.get("/", (req, res) => {
    let sess = req.session;
    res.redirect("admin/login");
});
router.get("/login", (req, res) => {
    let sess = req.session;
    // if(sess.token){
    //     console.log("Token found!", sess.token);
    // }
    res.render("../views/admin/page/login.ejs");
});

router.post("/login", authen_controller.login_authentication);

router.get("/logout", (req, res) => {
    let sess = req.session;

    sess.token = undefined;
    res.redirect("/admin/login");
});

router.get("/createUser", authen_controller.create_user);

module.exports = router;
