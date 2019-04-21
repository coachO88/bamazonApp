var mysql = require("mysql");
require("dotenv").config();
var { table } = require('table');
var prompt = require('prompt');

let productID = null;
let amount = null;
let cost = null;
let invertory = null;

let products = [
  ['Product ID', 'Product Name', 'Department Name', 'Price', 'Stock Quantity']
];

prompt.start();

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "rangel",

  // Your password
  password: "password",
  database: "bamazon"
});

connection.connect(function (err) {
  if (err) throw err;
  showTable();
});

function showTable() {
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      products.push([res[i].product_id, res[i].product_name, res[i].department_name, '$' + res[i].price, res[i].stock_quantity]);
    }
    let output = table(products);
    console.log('\n\n\nBAMAZON APP!!\n\n' + output);
    order();
  });
}

function order() {
  prompt.get(['Product_Id', 'Quantity'], function (err, result) {
    if (err) throw err;
    productID = result.Product_Id;
    amount = result.Quantity;
    checkInventory();
  });
}

function checkInventory() {
  connection.query("SELECT * FROM products WHERE product_id = " + productID, function (err, res) {
    console.log(productID)
    if (err) throw err;
    if (amount < res[0].stock_quantity) {
      cost = res[0].price;
      inventory = res[0].stock_quantity;
      submitOrder();
  } else {
      console.log("Insufficient Quantity");
    }
  });
}

function submitOrder() {
  var query = connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: JSON.stringify(inventory - amount)
      },
      {
        product_id: parseInt(productID)
      }
    ],
    function (err, res) {
      console.log('Inventory Updated\n');
      console.log("Total Cost " + (cost * amount));
      products = [
        ['Product ID', 'Product Name', 'Department Name', 'Price', 'Stock Quantity']
      ];
      connection.end();
    }
  );
}