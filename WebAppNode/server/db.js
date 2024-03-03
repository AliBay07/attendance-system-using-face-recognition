const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "oracle",
  database: "attendance_system",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("DB Connection Successful");
});

module.exports = connection;
