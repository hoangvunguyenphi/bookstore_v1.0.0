let request = require('request');
let api_mapping = require('./api-mapping.json');
var date = require("date-and-time");

let codeDef = "6e8ddd00-b140-4978-8df7-11e42ada0e08";
request.put(api_mapping.confirm_order.url + codeDef, { json: true }, (err, response, data) => {
    if (err) {
        res.send("Đơn đặt hàng đã hết hạn!");
        console.error(
            "Unable to query. Error:",
            JSON.stringify(err, null, 2)
        );
    } else {
        console.log(data)
        data.Items.forEach(function (item) {
            var orderID = item._orderID;
            var now = date.format(new Date(), "DD/MM/YYYY");
            var tt = {
                tentinhtrang: "Đã xác nhận",
                thoigian: now.toString(),
                motatt:
                    "Đơn hàng đã được xác nhận bởi khách hàng, chuyển sang trạng thái chờ chấp nhận từ quản trị."
            };
            var params = {
                TableName: "DA2Order",
                Key: {
                    _orderID: orderID
                },
                ReturnValues: "ALL_NEW",
                UpdateExpression:
                    "set  #tthh=:hh, #lstt= list_append(if_not_exists(#lstt, :empty_list), :ls)",
                ExpressionAttributeValues: {
                    ":hh": tt.tentinhtrang,
                    ":ls": [tt],
                    ":empty_list": []
                },
                ExpressionAttributeNames: {
                    "#tthh": "tinhtranghienhanh",
                    "#lstt": "lichsutinhtrang"
                }
            };
            console.log(params)
            let option = {
                url : api_mapping.update_order.url + codeDef,
                form : JSON.stringify(params)
            }
            console.log(JSON.stringify(option))
            request.put(option, (err2, response2, data2) => {
                if (err2) {
                    console.log(
                        "order - tinhtrang ::update::error - " +
                        JSON.stringify(err2, null, 2)
                    );
                } else {
                    data2 = JSON.parse(data2)
                    console.log(
                        "order - tinhtrang ::update::success " +
                        JSON.stringify(data2)
                    );
                    // res.render("../views/site/page/trac.ejs");
                }
            });
        });
    }
});