var express = require('express');
var router = express.Router();
const mysql = require('../services/dbconnect.js');

/* GET REWARDS PAGE. */
router.get('/', function(req, res, next) {
  res.send('REWARDS ROUTER');
});

module.exports = router;