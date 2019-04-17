// Set up dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");
var passwordModule = require("./password_module.js");

// Create connection to the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: passwordModule.password,
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    welcome();
});

function welcome() {
    console.log("\n *** WELCOME TO BAMAZON! ***");
    console.log("\n * Check out our products. * \n\n");
    showProducts();
};

function mainMenu() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "SHOP",
                "EXIT"
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "SHOP":
                    shopping();
                    break;

                case "EXIT":
                    console.log("\n Thank you for visiting Bamazon! \n")
                    connection.end();
                    break;
            }
        });
}

function shopping() {
    inquirer
        .prompt({
            name: "items",
            type: "input",
            message: "Please enter the ID of the item would you like to purchase.",
            validate: function (value) {
                if (isNaN(value) === false && value >= 1 && value <= 10) {
                    return true;
                }
                return false;
            }
        })
        .then(function (answer) {
            var query = "SELECT * FROM products WHERE item_id = ?";
            var requestedProduct = "";
            connection.query(query, [answer.items], function (err, res) {
                requestedProduct = res[0];
                productName = requestedProduct.product_name;
                console.log(" \n You have selected the " + productName + ". \n");

                inquirer
                    .prompt({
                        name: "quantity",
                        type: "input",
                        message: "How many units of the " + productName + " would you like to purchase?",
                        validate: function (value) {
                            if (isNaN(value) === false && value >= 1) {
                                return true;
                            }
                            return false;
                        }
                    })
                    .then(function (answer) {
                        console.log("\n You would like to buy a quantity of " + answer.quantity + ".\n");
                        updateProduct(requestedProduct, answer.quantity);
                    });

            });
        });
};

function showProducts() {
    var products = [];
    var productInfo = "";
    var query = "SELECT * FROM products";
    connection.query(query, function (err, res) {
        for (var i = 0; i < res.length; i++) {
            productInfo = "    ID: " + res[i].item_id + " || item: " + res[i].product_name + " || price: $" + res[i].price;
            products.push(productInfo);
            console.log(productInfo + "\n");
        }
        mainMenu();
    });
};

function updateProduct(product, quantity) {
    if (quantity > product.stock_quantity) {
        console.log("\n    INSUFFICIENT QUANTITY!\n");
        shopping();
    } else {
        var query = connection.query(
            "UPDATE products SET ? WHERE ?",
            [{
                    stock_quantity: product.stock_quantity - quantity
                },
                {
                    item_id: product.item_id
                }
            ],
            function (err, res) {
                console.log("\n    ORDER SUCCESSFUL!\n");
                function total() {
                    var totalAmount = product.price * quantity;
                    console.log("\n    Your total amount is $" + totalAmount + ".\n");
                };
                total();
                mainMenu();

            });
    };
}