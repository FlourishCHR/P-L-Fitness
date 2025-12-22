var express = require('express');
var router = express.Router();
const mysql = require('../services/dbconnect.js');


/* GET USERS PAGE. */
router.get('/', function(req, res, next) {
  res.render("users", { title: "Users" });
});

module.exports = router;