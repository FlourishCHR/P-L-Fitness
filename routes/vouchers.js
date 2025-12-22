var express = require('express');
var router = express.Router();
const mysql = require('../services/dbconnect.js');

/* GET VOUCHERS PAGE. */
router.get('/', function(req, res, next) {
  res.send('VOUCHERS ROUTER');
});

module.exports = router;