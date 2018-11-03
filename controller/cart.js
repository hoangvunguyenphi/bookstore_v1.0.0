// object Cart gồm các thuộc tính {object items},totalQty,totalprice và các hàm CRUD
module.exports = function Cart(oldCart) {
  this.items = oldCart.items || {};
  this.totalQty = oldCart.totalQty || 0;
  this.totalPrice = oldCart.totalPrice || 0;

  //Thêm
  this.add = function (item, id) {
    var storedItem = this.items[id];
    if (!storedItem) {
      storedItem = this.items[id] = {
        item: item,
        qty: 0,
        price: 0
      };
    }
    storedItem.qty++;
    storedItem.price = storedItem.item.gia * storedItem.qty;
    this.calculateTotal();
  };

  this.reduceByOne = function (id) {
    this.items[id].qty--;
    this.items[id].price -= this.items[id].item.price;
    this.totalQty--;
    this.totalPrice -= this.items[id].item.price;
    //Nếu nhập số lượng <0 thì xoá
    if (this.items[id].qty <= 0) {
      delete this.items[id];
    }
  };
  //Thêm
  this.add2 = function (item, id, qtyy) {
    if (typeof this.items[id] == 'undefined') {
      var storedItem = this.items[id];
      if (!storedItem) {
        storedItem = this.items[id] = {
          item: item,
          qty: 0,
          price: 0
        };
      }
      this.items[id].qty = parseInt(qtyy);
      this.items[id].price = parseInt(qtyy) * this.items[id].item.gia;
      this.calculateTotal();
    } else {
      this.items[id].qty += parseInt(qtyy);
      this.items[id].price += parseInt(qtyy) * this.items[id].item.gia;
      this.calculateTotal();
    }

  };
  //Xoá
  this.removeItem = function (id) {
    delete this.items[id];
    this.calculateTotal();
  };

  //Xuất ra mảng các object
  this.generateArray = function () {
    var arr = [];
    for (var id in this.items) {
      arr.push(this.items[id]);
    }
    return arr;
  };

  //update
  this.update = function (id, qtyy) {
    this.items[id].qty = qtyy;
    this.items[id].price = qtyy * this.items[id].item.gia;
    if (this.items[id].qty <= 0) {
      this.removeItem(id);
    }
    this.calculateTotal();
  };

  //calculate
  this.calculateTotal = function () {
    this.totalPrice = 0;
    this.totalQty = 0;
    for (var id in this.items) {
      var amout = this.items[id].item.gia * this.items[id].qty;
      this.totalPrice += amout;
      this.totalQty++;
    }
  };
};