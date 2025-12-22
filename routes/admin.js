var express = require('express');
var router = express.Router();
const mysql = require('../services/dbconnect.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


/* GET ADMIN PAGE. */
router.get('/', function(req, res, next) {
  res.render("admin", { title: "Admin" });
});


// LOGIN AUTH
// router.get("/", (req, res, next) => {
//   // DEBUGS SESSION USER
//   console.log('Session user:', req.session.user); 
//   if (!req.session.user) {
//     return res.redirect('/login');
//   }
//   res.render("admin", { user: req.session.user });
// });


router.get("/load", async(req, res)=> {

  try {
  
    const sql = `
    SELECT
    mu.mu_id,
    mu.mu_email,
    mu.mu_username,
    mu.mu_firstName,
    mu.mu_lastName,
    mu.mu_phoneNumber,
    mu.mu_role,
    mu.mu_specialty,
    mu.mu_status,
    mu.mu_createdAt,
    mu.mu_updatedAt,
    
    c.mu_firstName as createdByName,
    u.mu_firstName as updatedByName,
    d.mu_firstName as deletedByName

    FROM master_user mu
    LEFT JOIN master_user c ON mu.mu_createdById = c.mu_id
    LEFT JOIN master_user u ON mu.mu_updatedById = u.mu_id
    LEFT JOIN master_user d ON mu.mu_deletedById = d.mu_id
    WHERE mu.mu_status != 'DELETED' -- delete this to see 'DELETED' status
    ORDER BY mu.mu_createdAt DESC 
    `

    const result = await mysql.Query(sql);
    res.status(200).json({
      message: "Success",
      data: result
    });

  } catch (error) {
    res.status(500).json({
      message: "ERROR fetching users",
      data: error
    });
  };

});


// USER INSERTION
router.post("/insert", async (req, res)=> {
try {
  if (!req.user?.id) {
  return res.status(401).json({ 
    message: "Admin authentication required (Bearer token)" 
  });
  }
  const {
    email, username, password, 
    firstName, lastName, phoneNumber, 
    role, specialty, status,
  } = req.body;

  // PASSWORD VALIDATION
  if (!password || typeof password !== 'string' || password.trim().length < 8) {
    return res.status(400).json({ 
      message: "Password required and must be at least 8 characters" 
    });
  };

  // SALTING AND HASHING
  const hashedPassword = await bcrypt.hash(password.trim(), 12);

  // CHECK UNIQUE EMAIL
  const emailSqlexist = `SELECT 1 FROM master_user WHERE mu_email = ?`;
  let emailSqlresult = await mysql.Query(emailSqlexist, [email]);

  if (emailSqlresult.length > 0) {
    return res.status(409).json ({ message: "Email already exist" });
  };

  // CHECK UNIQUE USERNAME
  const usernameSqlexist = `SELECT 1 FROM master_user WHERE mu_username = ?`;
  let usernameSqlresult = await mysql.Query(usernameSqlexist, [username]);

  if (usernameSqlresult.length > 0) {
    return res.status(409).json ({ message: "Username already exist" });
  };

  const sql = `
  INSERT INTO master_user 
    (mu_email, 
    mu_username, 
    mu_password,
    mu_firstName, 
    mu_lastName, 
    mu_phoneNumber, 
    mu_role, 
    mu_specialty, 
    mu_status, 
    mu_createdById)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const result = await mysql.Query(sql, [email, username, hashedPassword,
    firstName, lastName, phoneNumber, role, specialty, status, req.user.id
  ]);
  res.status(201).json ({
    message: "User created successfully",
    userId: result.insertId,
    data: result
  });

} catch (error) {
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ 
      message: "Duplicated Email or Username",
      data: error
    });
  };
  console.error("Error: ", error);
  res.status(500).json({ 
    message: "Server Error (500)",
    data: error
  });
}
});


// USER UPDATE
router.put('/update', async (req, res)=> {
  try {
    if (!req.user?.id) {
  return res.status(401).json({ 
    message: "Admin authentication required (Bearer token)" 
  });
  }
    
    const {
    id, email, username, password,
    firstName, lastName, phoneNumber,
    role, specialty, status
  } = req.body;

  // ID VALIDATION
  if (!id || isNaN(id)) {
  return res.status(400).json({ message: "Valid ID required" });
};

  // PASSWORD VALIDATION
  if (!password || typeof password !== 'string' || password.trim().length < 8) {
    return res.status(400).json({ 
      message: "Password required and must be at least 8 characters" 
    });
  };

  // SALTING AND HASHING
  let hashedPassword;
  if (password && typeof password === 'string' && password.trim().length >= 8) {
    hashedPassword = await bcrypt.hash(password.trim(), 12);
  } else {
    
    const user = await mysql.Query('SELECT mu_password FROM master_user WHERE mu_id = ?', [id]);
    if (!user.length) return res.status(404).json({ message: 'User not found' });
    hashedPassword = user[0].mu_password;
  };

  // CHECK UNIQUE EMAIL
  const emailSqlexist = `SELECT 1 FROM master_user 
  WHERE mu_email = ? AND mu_id != ?`;
  let emailSqlresult = await mysql.Query(emailSqlexist, [email, id]);

  if (emailSqlresult.length > 0) {
    return res.status(409).json ({ message: "Email already exist" });
  };

  // CHECK UNIQUE USERNAME
  const usernameSqlexist = `SELECT 1 FROM master_user
  WHERE mu_username = ? AND mu_id != ?`;
  let usernameSqlresult = await mysql.Query(usernameSqlexist, [username, id]);

  if (usernameSqlresult.length > 0) {
    return res.status(409).json ({ message: "Username already exist" });
  };

  const sql = `
  UPDATE master_user
    SET mu_email = ?,
    mu_username = ?,
    mu_password = ?,
    mu_firstName = ?,
    mu_lastName = ?,
    mu_phoneNumber = ?,
    mu_role = ?,
    mu_specialty = ?,
    mu_status = ?,
    mu_deletedById = NULL,
    mu_updatedById = ?
  WHERE mu_id = ?
  `;

  const result = await mysql.Query(sql, [email, username, hashedPassword,
    firstName, lastName, phoneNumber, role, specialty, status, req.user.id, id,
  ]);

  if (result.affectedRows === 0) {
    return res.status(404).json ({ message: "User not found" });
  };

  res.status(200).json({
    message: "User updated successfully",
    affectedRows: result.affectedRows,
    data: result
  });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json ({ message: "Duplicated Email or Username" });
    };
    console.error("Error: ", error);
    res.status(500).json({ message: "Server Error"});
  };
});


// SOFT DELETE
router.put('/delete', async (req, res)=> {
  try {
    if (!req.user?.id) {
  return res.status(401).json({ 
    message: "Admin authentication required (Bearer token)" 
  });
  }
    
    const { id } = req.body;

    // ID VALIDATION
    if (!id || isNaN(id)) {
    return res.status(400).json({ message: "Valid ID required" });
    };

    const sql = `
    UPDATE master_user
    SET mu_email = CONCAT('DELETED_', mu_id, '@deleted.com'),
        mu_username = CONCAT('DELETED_', mu_id),
        mu_password = 'DELETED',
        mu_firstName = 'DELETED',
        mu_lastName = 'DELETED',
        mu_phoneNumber = 'DELETED',
        mu_role = 'DELETED',
        mu_specialty = 'DELETED',
        mu_status = 'DELETED',
        mu_deletedById = ?,
        mu_deletedAt = NOW()
    WHERE mu_id = ?
    `;

    const result = await mysql.Query(sql, [req.user.id, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    };

    res.status(200).json({
      message: "User has been soft deleted",
      affectedRows: result.affectedRows
    });

  } catch (error) {
    console.error("ERROR DELETE: ", error);
    res.status(500).json ({ message:  "Server Error"});
  };
});


module.exports = router;