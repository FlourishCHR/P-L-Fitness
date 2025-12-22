var express = require('express');
var router = express.Router();
const mysql = require('../services/dbconnect.js');

/* GET ATTENDANCE PAGE. */
router.get('/', function(req, res, next) {
  res.send('ATTENDANCE ROUTER');
});

module.exports = router;