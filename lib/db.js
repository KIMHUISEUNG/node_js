var mysql = require('mysql');
var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    //port     : 3307,
    password : '111111',
    database : 'opentutorials',
  });

  db.connect();
  module.exports = db;

  //window prot on ,Mac port off
