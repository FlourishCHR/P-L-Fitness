var express = require('express');
var router = express.Router();
const mysql = require('../services/dbconnect.js');

/* GET PAYMENTS PAGE. */
router.get('/', function(req, res, next) {
  res.send('PAYMENTS ROUTER');
});

module.exports = router;