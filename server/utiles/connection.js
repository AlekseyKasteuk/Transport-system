var mysql = require('mysql');
var config = require('../config').database;

var connection = mysql.createConnection(config);

connection.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

module.exports = connection;