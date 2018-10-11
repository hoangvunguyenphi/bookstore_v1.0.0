var AWS = require("aws-sdk");
//var upload_controller = require("../controller/upload_controller")
var Cart = require("./cart");
const UUID = require("uuid/v4");
let date = require("date-and-time");
var renameModule = require("../controller/edit_name");
var region = "us-west-2";
let awsConfig = {
  region: region,
  // endpoint: "http://localhost:8000",
  accessKeyId: "id",
  secretAccessKey: "keyhere"
};
AWS.config.update(awsConfig);

var ses = new AWS.SES();
let docClient = new AWS.DynamoDB.DocumentClient();

exports.add_order = function(req, res, next) {
  if (!req.session.cart) {
    return res.render("../views/site/page/cart", {
      products: [],
      totalPrice: 0,
      totalQty: 0
    });
  }
  var cart = new Cart(req.session.cart);
  var now = date.format(new Date(), "DD/MM/YYYY");
  // res.render("../views/site/page/cart", {
  //     products: cart.generateArray(),
  //     totalPrice: cart.totalPrice,
  //     totalQty: cart.totalQty
  // });
  var params = {
    TableName: "DA2Order",
    Item: {
      _orderID: UUID(),
      ngaylaphoadon: now.toString(),
      tennguoinhan: req.body.tennguoinhan,
      sodienthoai: req.body.sodienthoai,
      email: req.body.diachiemail,
      diachi: req.body.diachichitiet,
      ghichu: req.body.ghichu,
      tienship: 1111,
      items: cart.generateArray(),
      tongtienthanhtoan: cart.totalPrice,
      tinhtrang: "Chưa xác nhận",
      ngaythanhtoan: " ",
      codeDef: UUID(),
      ipClient: req.body.ipClient //check ip customer để tránh spam, thêm condition Expression limit đơn đặt hàng trong 1 khoảng time
    }
  };
  console.log(params.Item);
  docClient.put(params, function(err, data) {
    if (err) {
      console.error(
        "Unable to add book",
        ". Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      req.session.cart = null;
      var eparam = {
        Destination: {
          ToAddresses: [params.Item.email]
        },
        Message: {
          Body: {
            Html: {
              Data:
                "<p>Chào bạn" +
                params.Item.tennguoinhan +
                '! Đây là email xác nhận đơn hàng bạn vừa đặt </p> <a href="localhost:3000/xacNhanOrder/"' +
                params.Item.codeDef +
                ">Nhấn vào đây để xác nhận đơn đặt hàng</a>"
            },
            Text: {
              Data:
                "Mã đơn hàng:" +
                params.Item._orderID +
                "\n Tổng tiền:" +
                params.Item.tongtienthanhtoan +
                "Link xác nhận: localhost:3000/xacNhanOrder/" +
                params.Item.codeDef
            }
          },
          Subject: {
            Data: "[Sách] Xác nhận đơn đặt hàng! "
          }
        },
        Source: "vitconse@gmail.com",
        ReplyToAddresses: ["vitconse@gmail.com"],
        ReturnPath: "vitconse@gmail.com"
      };
      ses.sendEmail(eparam, function(err, data) {
        if (err) console.log(err);
        else {
          console.log(data);
          res.render("../views/site/page/order-received.ejs", {
            recieved_order: params.Item,
            products: [],
            totalPrice: params.Item.tongtienthanhtoan,
            tienship: params.Item.tienship,
            totalQty: 0
          });
        }
      });
    }
  });
};
exports.xacNhanOrder = function(req, res) {
  var codeDef = req.params.codeDef;
  console.log(codeDef);
  var sparams = {
    TableName: "DA2Order",
    FilterExpression: "#code = :cd",
    ExpressionAttributeValues: {
      ":cd": codeDef
    },
    ExpressionAttributeNames: {
      "#code": "codeDef"
    }
  };
  docClient.scan(sparams, function(err, data) {
    if (err) {
      res.send("Đơn đặt hàng đã hết hạn!");
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      data.Items.forEach(function(tt) {
        console.log(tt.tinhtrang);
        var params = {
          TableName: "DA2Order",
          Key: {
            _orderID: tt._orderID
          },
          UpdateExpression: "set #tinhtrang=:ttr",
          ExpressionAttributeValues: {
            ":ttr": "Đã xác nhận"
          },
          ExpressionAttributeNames: {
            "#tinhtrang": "tinhtrang"
          },
          ReturnValues: "UPDATED_NEW"
        };
        docClient.update(params, function(err, data) {
          if (err) {
            console.log(
              "order - tinhtrang ::update::error - " +
                JSON.stringify(err, null, 2)
            );
          } else {
            console.log(
              "order - tinhtrang ::update::success " + JSON.stringify(data)
            );
            res.send(
              "Chúc mừng bạn đã đặt hàng thành công ! Đơn hàng sẽ được đóng gói và giao hàng trong thời gian 2-3 ngày"
            );
          }
        });
      });
    }
  });
};
