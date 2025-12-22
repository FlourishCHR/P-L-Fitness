var express = require('express');
var router = express.Router();
const mysql = require('../services/dbconnect.js');

/* GET SESSIONS PAGE. */
router.get('/', function(req, res, next) {
  res.send('SESSIONS ROUTER');
});

module.exports = router;