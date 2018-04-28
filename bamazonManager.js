const mysql = require("mysql")

const inquirer = require("inquirer")

require('events').EventEmitter.prototype._maxListeners = 100;

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon_db"
});

// Start Page

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
        console.log("Add a New Product")
        console.log("===================================")
        addProduct();
        break
      case "Add to Inventory":
        console.log("Add to Inventory")
        console.log("===================================")
        addInventory();
        break
    }
  })
}


// View Products Function

function viewProducts() {
  connection.query("SELECT product_name FROM products", function (err, res) {
    if (err) throw err;
    console.log("===================================")
    let items = '';
    for (var i = 0; i < res.length; i++) {
      items = '';
      items += 'Product Name: ' + res[i].product_name
      console.log(items.toUpperCase());
    }
    return setTimeout(function () {
      managerPortal()
    }, 4000);
  })
}

// View Low Inventory Function

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
    return setTimeout(function () {
      managerPortal()
    }, 4000);
  })
}

// Add New Product Function

function addProduct() {
  inquirer
    .prompt([{
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
        "INSERT INTO products SET ?", {
          product_name: answer.newProduct,
          department_name: answer.department,
          price: answer.price,
          stock_quantity: answer.quantity
        },
        function (err) {
          if (err) throw err;
          console.log("Your product was created successfully!");
          setTimeout(function () {}, 3000);
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
                return setTimeout(function () {
                  start()
                }, 2000);
            }
          })
        }
      );
    });
  }

// Add Inventory

function addInventory() {
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    console.log("Add Inventory to these items");
    let items = '';
    for (var i = 0; i < res.length; i++) {
      items = '';
      items += 'Item ID: ' + res[i].item_id + '  //  ';
      items += 'Quantity: ' + res[i].stock_quantity + '\n';
      console.log(items);
    }

    console.log("---------------------------------------------------------------------")
    whichItem()

  });
}

function whichItem() {
  inquirer.prompt([{
    type: 'input',
    name: 'item_id',
    message: "What's the ID of the item you'd like to add inventory to?",
    validate: validateInput,
    filter: Number
  },
  {
    type: 'input',
    name: 'quantity',
    message: 'How many do you add?',
    validate: validateInput,
    filter: Number
  }
  ]).then(function (choice) {
    doDatAdd(choice)
  })
}

function doDatAdd(choice) {
  const query = connection.query(
    `SELECT * FROM products WHERE item_id = ${choice.item_id}`, function (err, res) {
      choiceQty = choice.quantity
      itemStock = res[0].stock_quantity
    
      choiceID = choice.item_id
      itemName = res[0].product_name
      if (err) throw Error(err);
      total = choice.quantity 
      stillBuy(total, choiceQty);
    }
  )
}

function stillBuy(total) {
  inquirer.prompt([{
    type: 'list',
    name: 'decision',
    message: `You want to add ${total}. Is that cool?`,
    choices: ["Yes", "No"]
  }]).then(res => {
    switch (res.decision) {
      case "Yes":
        console.log("Nice!!")
        connection.query("UPDATE products SET ? WHERE ?",
          [
            {
              stock_quantity: (itemStock + choiceQty)
            },
            {
              item_id: (choiceID)
            }
          ])
        return setTimeout(function () { start() }, 3000);
      case "No":
        console.log("Returning to Manager Portal");
        return setTimeout(function () { start() }, 3000);
    }
  })
}


function start() {
  managerPortal();
}

function validateInput(value) {
  var integer = Number.isInteger(parseFloat(value));
  var sign = Math.sign(value);
  if (integer && (sign === 1)) {
    return true;
  } else {
    return 'Please enter a whole non-zero number.';
  }
}

start();