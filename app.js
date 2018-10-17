var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var logger = require("morgan");
var bodyParser = require("body-parser");
var indexRouter = require("./routes/index");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/assets/css/", express.static(__dirname + "/assets/css"));
app.use("/assets/js/", express.static(__dirname + "/assets/js"));
app.use("/assets/images/", express.static(__dirname + "/assets/images"));
app.use("/assets/fonts/", express.static(__dirname + "/assets/fonts"));
app.use("/assets/sass/", express.static(__dirname + "/assets/sass"));

app.use(
  session({
    secret: "hoangvunguyenphi",
    resave: false,
    saveUninitialized: true
  })
);
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  var Cart = require("./controller/cart");
  if (!req.session.cart) {
    return res.render("../views/404.ejs", {
      allBooks: [],
      products: [],
      totalPrice: 0,
      totalQty: 0
    });
  }
  var cart = new Cart(req.session.cart);
  res.render("../views/error.ejs", {
    allBooks: [],
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
    totalQty: cart.totalQty
  });
});
app.locals.cat = require('./db/test/category/category_data.json');
module.exports = app;