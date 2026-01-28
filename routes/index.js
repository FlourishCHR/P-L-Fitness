var express = require('express');
var router = express.Router();
const mysql = require('../services/dbconnect.js');

/* GET HOMEPAGE - Serve React app */
router.get('/', function(req, res, next) {
  res.sendFile('index.html', { root: './build' });
});


module.exports = router;
