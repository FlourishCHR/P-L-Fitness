var express = require('express');
var router = express.Router();
const mysql = require('../services/dbconnect.js');

/* GET ADMIN PAGE. */
router.get('/', function(req, res, next) {
  res.send('ADMIN ROUTER');
});

module.exports = router;