var express = require('express');
var router = express.Router();
const mysql = require('../services/dbconnect.js');

/* GET HOMEPAGE. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


module.exports = router;
