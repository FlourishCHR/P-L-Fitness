var express = require('express');
var router = express.Router();
const mysql = require('../services/dbconnect.js');

/* GET USERS PAGE. */
router.get('/', function(req, res, next) {
  res.render( "users", { title: "Express" });
  res.send('respond with a resource');
});

// LOGIN
// router.get("/", (req, res, next) => {
//   // DEBUGS SESSION USER
//   console.log('Session user:', req.session.user); 
//   if (!req.session.user) {
//     return res.redirect('/login');
//   }
//   res.render("course", { user: req.session.user });
// });

router.get("/load", (req, res)=> {
  
  try {
    const sql = `SELECT * FROM master_user`;

    mysql.Query(sql)
    .then((result)=> {
      res.status(200).json({
        message: "Success",
        data: result
      });
    })
    .catch((error)=> {
      res.status(500).json({
        message: "Error fetching users",
        data: error
      });
    });

  } catch (error) {
    console.log(error);
  }

})


module.exports = router;
