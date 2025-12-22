var express = require('express');
var router = express.Router();
const mysql = require('../services/dbconnect.js');

/* GET MEMBERSHIPS PAGE. */
router.get('/', function(req, res, next) {
  res.send('MEMBERSHIPS ROUTER');
});

module.exports = router;