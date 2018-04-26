const mysql = require("mysql")

const inquirer = require("inquirer")

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon_db"
});

function managerPortal() {
  inquirer.prompt([{
    type: 'list',
    name: 'manager',
    message: "What would you like to do?",
    choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add a New Product"]
  }]).then(res => {
    switch (res.manager) {
      case "View Products for Sale": 
        console.log("Current Products")
        viewProducts();
        break
      case "View Low Inventory":
        console.log("These products are low on inventory")
        console.log("===================================")
        viewLowInventory();
        break
      case "Add to Inventory":
        console.log("Add to Inventory")
        console.log("===================================")
        break
      case "Add a New Product":
        console.log("Add a New Product")
        console.log("===================================")
        break
    }
  })
}

function viewProducts(){
  connection.query("SELECT product_name FROM products", function (err, res) {
    if (err) throw err;
    console.log("===================================")
    let items = '';
    for (var i = 0; i < res.length; i++) {
      items = '';
      items += 'Product Name: ' + res[i].product_name
      console.log(items);
    }
  })
}

function viewLowInventory() {
  connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
    if (err) throw err;
    let items = '';
    for (var i = 0; i < res.length; i++) {
      items = '';
      items += 'Product Name: ' + res[i].product_name + '  //  ';
      items += 'Quantity: ' + res[i].stock_quantity + '\n';
      console.log(items);
    }
  })
}

function addInventory() {

}

function addProduct() {

}

function start() {
  managerPortal();
}

start();