const mysql = require("mysql");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env._HOST_ADMIN,
  user: process.env._USER_ADMIN,
  password: process.env._PASSWORD_ADMIN,
  database: process.env._DATABASE_ADMIN,
  timezone: "PST",
});

exports.CheckConnection = () => {
  connection.connect((err) => {
    if (err) {
      console.error("Error connection to MYSQL database: ", err);
      return;
    }
    console.log("MySQL database connection established successfully!");
  });
};

exports.Query= (sql, params = []) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) {
        // logger.error(error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};