var express = require('express');
var router = express.Router();
const mysql = require('../services/dbconnect.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/* GET AUTH PAGE. */
router.get('/', function(req, res, next) {
  res.send('AUTH ROUTER');
});

router.post('/login', async(req, res)=> {
  try {
    
    const { username, password } = req.body;
    const sql = `
    SELECT * FROM master_user WHERE mu_username = ? AND mu_status != 'DELETED'
    `;
    const user = await mysql.Query(sql, [username]);

    if (!user.length || !await bcrypt.compare(password, user[0].mu_password)) {
      return res.status(401).json({ message: "INVALID CREDENTIALS" });
    };

    const token = jwt.sign(
      { id: user[0].mu_id,
        role: user[0].mu_role
      },
      process.env.JWT_SECRET,
      { expiresIn:'1h' }
    );
    res.json({
      token,
      user: {
        id: user[0].mu_id,
        role: user[0].mu_role
      }
    });

  } catch (error) {
    res.status(500).json({ message: "SERVER ERROR (500)" });
  }
});


module.exports = router;