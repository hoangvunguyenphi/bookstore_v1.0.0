exports.editName = function (str) {
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/ /g, "-");
  str = str.replace(/\./g, "-");
  str = str.replace(/\?/g, "-");
  return str;
};

exports.splitList = function (str) {
  if (str == null || str == "" || typeof str == "undefined") {
    return [];
  } else {
    str = String(str);
    var arr = str.split(",");
    arr = arr.map(function (val) {
      val = val.trim();
      return val;
    });
    return arr;
  }
};

exports.formatNumber = function (nStr, decSeperate, groupSeperate) {
  nStr += '';
  x = nStr.split(decSeperate);
  x1 = x[0];
  x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + groupSeperate + '$2');
  }
  return x1 + x2;
}
// var str = "Paulo Coelho"
// var arr = str.split(",");
// arr = arr.map(function (val) {
//         val = val.trim();
//         return val;
// });
// console.log(arr);