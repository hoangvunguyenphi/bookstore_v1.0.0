// const UUID = require("uuid/v4");
// var multer = require("multer");
// var multerS3 = require("multer-s3");
// var path = require("path");
// const mime = require("mime");
// var AWS = require("aws-sdk");

// var keyImgUpload = "";
// const awsconfig = require("../aws-config.json");
// const accessKeyId = awsconfig.AWS.accessKeyId;
// const secretAccessKey = awsconfig.AWS.secretAccessKey;
// const region = awsconfig.AWS.region;
// AWS.config.update({
//     accessKeyId,
//     secretAccessKey,
//     region
// });
// var s3 = new AWS.S3();
// exports.upload_image = function (req, res, next) {
//     var upload = multer({
//         limits: {
//             fileSize: 3 * 1024 * 1024
//         },
//         fileFilter: function (req, file, cb) {
//             var filetypes = /jpeg|jpg|png|gif|bmp/;
//             var mimetype = filetypes.test(file.mimetype);
//             var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//             if (mimetype && extname) {
//                 return cb(null, true);
//             }
//             cb(
//                 "Error: File upload only supports the following filetypes - " + filetypes
//             );
//         },
//         storage: multerS3({
//             s3: s3,
//             bucket: "da2-book",
//             metadata: function (req, file, cb) {
//                 cb(null, {
//                     fieldName: file.originalname
//                 });
//             },
//             acl: "public-read",
//             key: function (req, file, cb) {
//                 console.log(file);
//                 keyImgUpload = UUID() + "." + mime.getExtension(file.mimetype);
//                 console.log(keyImgUpload);
//                 cb(null, keyImgUpload);
//             }
//         })
//     });
//     return upload.single("newImgUpload")(req, res, next)
//     return keyImgUpload;
//     return next();
// }