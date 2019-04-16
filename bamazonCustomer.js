// Set up dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");
var password = require("./password_module.js");

// Create connection to the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: password.password,
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    start();
});

function start() {
    console.log("\n WELCOME TO THE INVENTORY: \n");
    var query = "SELECT * FROM products";
    connection.query(query, function (err, res) {
        for (var i = 0; i < res.length; i++) {
            console.log("\n   " + res[i].product_name + "\n");
        }
    });
}