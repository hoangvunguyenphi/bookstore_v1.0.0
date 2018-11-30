var AWS = require("aws-sdk");
//var upload_controller = require("../controller/upload_controller")
var Cart = require("./cart");
const UUID = require("uuid/v4");
let date = require("date-and-time");
var renameModule = require("../controller/edit_name");
var awsconfig = require("../../aws-config.json");
const accessKeyId = awsconfig.AWS.accessKeyId;
const secretAccessKey = awsconfig.AWS.secretAccessKey;
const region = awsconfig.AWS.region;
var endpoint = "http://localhost:8000";
AWS.config.update({
  accessKeyId,
  secretAccessKey,
  region,
  endpoint
});

var ses = new AWS.SES();
let docClient = new AWS.DynamoDB.DocumentClient();

exports.add_order = function (req, res, next) {
  if (!req.session.cart) {
    return res.render("../views/site/page/cart", {
      products: [],
      totalPrice: 0,
      totalQty: 0
    });
  }
  var cart = new Cart(req.session.cart);
  console.log(cart.generateArray())
  var now = date.format(new Date(), "DD/MM/YYYY");
  var params = {
    TableName: "DA2Order",
    Item: {
      _orderID: UUID(),
      ngaylaphoadon: now.toString(),
      tennguoinhan: req.body.tennguoinhan,
      sodienthoai: req.body.sodienthoai,
      email: req.body.diachiemail,
      diachi: req.body.diachichitiet,
      ghichu: req.body.ghichu || " ",
      tienship: 1111,
      items: cart.generateArray(),
      tongtienthanhtoan: cart.totalPrice,
      tinhtrang: "Chờ xác nhận",
      ngaythanhtoan: " ",
      codeDef: UUID(),
      ipClient: req.body.ipClient // có thể sẽ check ip customer để tránh spam, thêm condition Expression limit đơn đặt hàng trong 1 khoảng time// chưa làm
    }
  };
  console.log(params.Item);
  var bodymail = `<table border="1"  style="width:100%;border-collapse: collapse;"><tr>
  <th>Sản phẩm</th>
  <th>Giá</th>
  <th>Số lượng</th>
  <th>Thành tiền</th>
</tr>`;

  params.Item.items.forEach(function (it) {
    bodymail += `<tr>
  <td>
    ` + it.item.tieude + `
  </td>
  <td>
  ` + it.item.gia + `
  </td>
  <td>
    ` + it.qty + `
  </td>
  <td>
    ` + it.price + `
  </td>
</tr>`;

  });
  bodymail += "</table> ";
  console.log(bodymail)
  docClient.put(params, function (err, data) {
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
              Data: `<h2> Chào bạn ` +
                params.Item.tennguoinhan + `!</h2> <p>
                Đây là email với mục đích xác nhận đơn hàng bạn vừa đặt, vui lòng kiểm tra thông tin bên dưới và sau đó ` + `<b><a style="font-size:25px" href="http://localhost:3000/xacNhanOrder/` + params.Item.codeDef + `
                ">nhấn vào đây ✔✔</a> </b> để xác nhận đơn hàng !</p>` +
                `<p><b>Thông tin người nhận</b></p><table  border="1"  style="width:100%;border-collapse: collapse;"><tr>
                <td>Mã đơn hàng</td><td>` + params.Item._orderID + `</td>
                </tr>
                <tr>
                  <td>Tên người nhận:</td><td>` + params.Item.tennguoinhan + `</td>
                </tr>
                <tr>
                  <td>Địa chỉ nhận</td><td>` + params.Item.diachi + `</td>
                </tr>
                <tr>
                  <td>Số điện thoại nhận hàng</td><td>` + params.Item.sodienthoai + `</td>
                </tr>
                </table>
                <p><b>Thông tin đơn hàng</b></p>
                ` + bodymail
            },
            Text: {
              Data: "Mã đơn hàng:" +
                params.Item._orderID
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
      ses.sendEmail(eparam, function (err, data) {
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

exports.xacNhanOrder = function (req, res) {
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
  docClient.scan(sparams, function (err, data) {
    if (err) {
      res.send("Đơn đặt hàng đã hết hạn!");
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      data.Items.forEach(function (tt) {
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
        docClient.update(params, function (err, data) {
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

exports.getAllOrder = function (req, res) {
  var params = {
    TableName: "DA2Order"
  };
  //DUYET TAT CA COLLECTIONS TREN TABLE
  docClient.scan(params, onScan);

  function onScan(err, data) {
    if (err) {
      console.error(
        "\nUnable to scan the table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.send(JSON.stringify(err, null, 2));
    } else {
      res.render("../views/admin/page/list-order.ejs", {
        allOrder: data.Items
      })
    }
  }
};


exports.getDetailOrder = function (req, res) {
  var orderID = req.params.id;
  var params = {
    TableName: "DA2Order",
    KeyConditionExpression: "#ma = :id",
    ExpressionAttributeNames: {
      "#ma": "_orderID"
    },
    ExpressionAttributeValues: {
      ":id": orderID
    }
  };
  docClient.query(params, function (err, data) {
    if (err) {
      console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
      res.send(JSON.stringify(err, null, 2));
    } else {
      res.render("../views/admin/page/orderDetail.ejs", {
        orderDetail: data.Items,
      })
    }
  });
}