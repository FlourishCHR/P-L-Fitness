var express = require('express');
var router = express.Router();
const mysql = require('../services/dbconnect.js');

/* GET EQUIPMENT PAGE. */
router.get('/', function(req, res, next) {
  res.send('EQUIPMENT ROUTER');
});

module.exports = router;