var aws = require("aws-sdk");
var ses = new aws.SES({
    accessKeyId: "id",
    secretAccessKey: "keyhere",
    "region": "us-west-2"
});
var eparam = {
    Destination: {
        ToAddresses: ["vitconse@gmail.com"]
    },
    Message: {
        Body: {
            Html: {
                Data: '<p>Click <a href="http://localhost:3000">here</a> to reset your password</p>'
            },
            Text: {
                Data: "Mã đơn hàng"
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
    }
});