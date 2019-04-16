// Set up dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");

// Create connection to the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon"
});

