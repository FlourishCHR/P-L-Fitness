var express = require('express');
var router = express.Router();
var path = require('path');

/* GET HOMEPAGE - Serve React app */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});


module.exports = router;
