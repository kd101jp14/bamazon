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
            var query = "SELECT * FROM products";
            // Subtract 1 to make sure that the number enetered by the user matches the requested product, as the products start at index 0.
            answer.items = Number(answer.items) - 1;
            var requestedProduct = "";
            connection.query(query, [answer.items], function (err, res) {
                requestedProduct = res[answer.items].product_name;
                console.log(" \n You have selected the " + requestedProduct + ". \n");

                inquirer
                    .prompt({
                        name: "quantity",
                        type: "input",
                        message: "How many units of the " + requestedProduct + " would you like to purchase?",
                        validate: function (value) {
                            if (isNaN(value) === false && value >= 1) {
                                return true;
                            }
                            return false;
                        }
                    })
                    .then(function (answer) {
                        var query = "SELECT * FROM products";
                        var requestedQuantity = "";
                        connection.query(query, [answer.items], function (err, res) {
                            var requestedQuantity = answer.quantity;
                            console.log("\n You would like to buy a quantity of " + requestedQuantity + ". \n");
                            updateProduct(answer.items, requestedQuantity);
                        });
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

function updateProduct(id, quantity) {
    console.log(id);
    console.log(quantity);
    var query = connection.query(
        "UPDATE products SET ? WHERE ?",
        [{
            stock_quantity: "stock_quantity -" + quantity
        },
        {
            item_id: id
        }],
        function (err, res) {
            if (quantity < 0) {
                console.log("\nINSUFFICIENT QUANTITY!\n")
                shopping();
            } else if (quantity === 0) {
                connection.query(
                    "DELETE FROM products WHERE ?", {
                        item_id: id
                    },
                    function (err, res) {
                        console.log("This item is now no longer in stock.");
                    }
                );

            } else {

                console.log("\n" + res.affectedRows + " products updated!\n");
                console.log(query.sql);
            };
        });
}