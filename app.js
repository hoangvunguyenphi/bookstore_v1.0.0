var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var logger = require("morgan");
var bodyParser = require("body-parser");
var indexRouter = require("./routes/index");
var adminRouter = require("./routes/admin");
var productRouter = require("./routes/product");
var orderRouter = require("./routes/order");
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
// app.use("/assets/css/", express.static(__dirname + "/assets/css"));
// app.use("/assets/js/", express.static(__dirname + "/assets/js"));
// app.use("/assets/images/", express.static(__dirname + "/assets/images"));
// app.use("/assets/fonts/", express.static(__dirname + "/assets/fonts"));
// app.use("/assets/sass/", express.static(__dirname + "/assets/sass"));

app.use(
  session({
    secret: "hoangvunguyenphi",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/", indexRouter);
app.use("/admin", adminRouter);
app.use("/admin/product", productRouter);
app.use("/admin/order", orderRouter);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  console.log(err);
  res.render("../views/error.ejs");
});
app.locals.cat = require('./db/test/category/category_data.json');
app.locals.editName = require('./controller/edit_name');
module.exports = app;