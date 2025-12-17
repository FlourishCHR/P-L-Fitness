var express = require('express');
var router = express.Router();
const mysql = require('../services/dbconnect.js');

/* GET AUTH PAGE. */
router.get('/', function(req, res, next) {
  res.send('AUTH ROUTER');
});

module.exports = router;