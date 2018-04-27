const mysql = require("mysql")

const inquirer = require("inquirer")

require('events').EventEmitter.prototype._maxListeners = 100;

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
      case "Add a New Product":
        console.log("Add to Inventory")
        console.log("===================================")
        addProduct();
        break
      case "Add to Inventory":
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
      console.log(items.toUpperCase());
    }
    return setTimeout(function () { managerPortal() }, 4000);
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
      console.log(items.toUpperCase());
      
    }
    return setTimeout(function () { managerPortal() }, 4000);
  })
}

function addProduct() {
  inquirer
    .prompt([
      {
        name: "newProduct",
        type: "input",
        message: "What is the product you would like to add?"
      },
      {
        name: "department",
        type: "input",
        message: "What department would you like to place your product in?"
      },
      {
        name: "price",
        type: "input",
        message: "What is the price of this item?",
        validate: function (value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },
      {
        name: "quantity",
        type: "input",
        message: "How many do you have?",
        validate: function (value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function (answer) {
      
      connection.query(
        "INSERT INTO products SET ?",
        {
          product_name: answer.newProduct,
          department_name: answer.department,
          price: answer.price,
          stock_quantity: answer.quantity
        },
        function (err) {
          if (err) throw err;
          console.log("Your product was created successfully!");
          setTimeout(function () { }, 3000);
          inquirer.prompt([{
            type: 'list',
            name: 'addMore',
            message: "Would you like to add another product?",
            choices: ["Yes", "No"]
          }]).then(res => {
            switch (res.addMore) {
              case "Yes":
                return addProduct();
              case "No":
                console.log("You will be returned to the main screen");
                return setTimeout(function () { start() }, 2000);
            }
          })
        }
      );
    });
}

function addInventory() {

}


function start() {
  managerPortal();
}

start();