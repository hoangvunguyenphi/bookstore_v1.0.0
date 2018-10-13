// var AWS = require("aws-sdk");
// const awsconfig = require("../aws-config.json");
// const accessKeyId = awsconfig.AWS.accessKeyId;
// const secretAccessKey = awsconfig.AWS.secretAccessKey;
// const region = awsconfig.AWS.region;
// AWS.config.update({
//     accessKeyId,
//     secretAccessKey,
//     region
// });
// var ses = new AWS.SES();
// var eparam = {
//     Destination: {
//         ToAddresses: ["vitconse@gmail.com"]
//     },
//     Message: {
//         Body: {
//             Html: {
//                 Data: '<p>Click <a href="http://localhost:3000">here</a> to reset your password</p>'
//             },
//             Text: {
//                 Data: "Mã đơn hàng"
//             }
//         },
//         Subject: {
//             Data: "[Sách] Xác nhận đơn đặt hàng! "
//         }
//     },
//     Source: "vitconse@gmail.com",
//     ReplyToAddresses: ["vitconse@gmail.com"],
//     ReturnPath: "vitconse@gmail.com"
// };
// ses.sendEmail(eparam, function (err, data) {
//     if (err) console.log(err);
//     else {
//         console.log(data);
//     }
// });