const mysql = require("mysql")

const inquirer = require("inquirer")

let total = ""

let itemStock = ""

let choiceQty = ""

let choiceID = ""

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon_db"
});


function allProducts() {
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    console.log("Current Products for Sale");
    var items = '';
    for (var i = 0; i < res.length; i++) {
      items = '';
      items += 'Item ID: ' + res[i].item_id + '  //  ';
      items += 'Product Name: ' + res[i].product_name + '  //  ';
      items += 'Department: ' + res[i].department_name + '  //  ';
      items += 'Price: $' + res[i].price + '\n';
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
      message: "What's the ID of the item you'd like to purchase?",
      validate: validateInput,
      filter: Number
    },
    {
      type: 'input',
      name: 'quantity',
      message: 'How many do you need?',
      validate: validateInput,
      filter: Number
    }
  ]).then(function (choice) {
    purchase(choice)
  })
}

function purchase(choice){
  const query = connection.query(
    `SELECT * FROM products WHERE item_id = ${choice.item_id}`, function(err, res, fields) {
      choiceID = choice.item_id
      choiceQty = choice.quantity
      itemStock = res[0].stock_quantity
      if (err) throw Error(err);
      if (itemStock > choiceQty){
        
       total = choice.quantity * res[0].price;
        stillBuy(total, choiceQty)
      }else {
        console.log("Sorry we don't have that much of that shit")

        keepShopping();
      }
      
    }
  )
}

function stillBuy(total) {
  inquirer.prompt([{
    type: 'list',
    name: 'decision',
    message: `Your total is $${total}. Is that cool?`,
    choices: ["Yes", "No"]
  }]).then(res => {
    switch (res.decision) {
      case "Yes":
        console.log("Thank you for your purchase!")
        connection.query("UPDATE products SET ? WHERE ?",
          [
            {
              stock_quantity: (itemStock - choiceQty)
            },
            {
              item_id: (choiceID)
            }
          ])
        return setTimeout(function(){start()}, 3000);
      case "No":
        console.log("Thank you for shopping with Bamazon! Come back soon!");
        return setTimeout(function () { start() }, 3000);
    }
  })
}

function keepShopping() {
  inquirer.prompt([{
    type: 'list',
    name: 'keepShopping',
    message: "Would you like to keep shopping?",
    choices: ["Yes", "No"]
  }]).then(res => {
    switch(res.keepShopping) {
      case "Yes":
        return start();
      case "No":
        console.log("Thank you for shopping with Bamazon! Come back soon!");
        break;
      default:
        return
    }
  })
}


function start() {
  allProducts();
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