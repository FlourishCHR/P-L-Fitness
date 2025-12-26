var express = require('express');
var router = express.Router();
const mysql = require('../services/dbconnect.js');

/* GET PAYMENTS PAGE. */
router.get('/', function(req, res, next) {
  res.send('PAYMENTS ROUTER');
});

router.get("/load", async (req, res)=> {
  try {
    
    const sql = `
    SELECT
      mp.mp_id,
      mp.mu_id,
      CONCAT(mu.mu_firstName, ' ', mu.mu_lastName) as memberName,
      mp.mm_id,
      mm.mm_planType,
      mp.mp_amount,
      mp.mp_mop,
      mp.mp_status,
      mp.mp_paymentDate
    FROM master_payment mp
    LEFT JOIN master_user mu ON mp.mu_id = mu.mu_id
    LEFT JOIN master_membership mm ON mp.mm_id = mm.mm_id
    -- WHERE mp.mp_status != 'DELETED' -- delete this to see 'DELETED' status
    -- AND mu.mp_status != 'DELETED' -- delete this to see 'DELETED' status
    ORDER BY mp.mp_paymentDate DESC
    `;

    const result = await mysql.Query(sql);
    res.status(200).json({
      message: "Success",
      data: result
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching payments",
      data: error
    });
  };

});


// PAYMENT INSERTION
router.post("/insert", async (req, res)=> {
  try {

    if (!req.user?.id) {
      return res.status(401).json({
        message: "Authentication required (Bearer token)"
      });
    }

    const {
      mm_id, mu_id, amount, mop, status 
    } = req.body;

    // VALIDATION
    if ( !mm_id || !mu_id || !amount || !mop ) {
      return res.status(400).json ({
        message: "mm_id, mu_id, amount, mop required",
        validMOP: ["CASH", "CREDIT", "DEBIT", "OTHER"],
        validStatus: ["PAID", "PENDING", "CANCELLED", "REFUNDED"]
      });
    }

    const sql = `
    INSERT INTO master_payment
      (mm_id,
      mu_id,
      mp_amount,
      mp_mop,
      mp_status)
    VALUES (?, ?, ?, ?, ?)`;

    const result = await mysql.Query(sql, [mm_id, mu_id, amount,
      mop, status || "PAID"
    ]);
    res.status(201).json ({
      message: "Payment created successfully",
      data: result
    });
    
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Duplicated Entry",
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


// PAYMENT UPDATE
router.put("/update", async (req, res)=> {
  try {
    
    if(!req.user?.id) {
      return res.status(401).json({
        message: "Authentication required (Bearer token)"
      });
    }
    const {
      id, amount, mop, status
    } = req.body;

    // VALIDATION
    if ( !id || !amount || !mop ) {
      return res.status(400).json ({
        message: "id, amount, mop required",
        validMOP: ["CASH", "CREDIT", "DEBIT", "OTHER"],
        validStatus: ["PAID", "PENDING", "CANCELLED", "REFUNDED"]
      });
    }

    const sql = `
    UPDATE master_payment
      SET mp_amount = ?,
      mp_mop = ?,
      mp_status = ?
    WHERE mp_id = ?`;

    const result = await mysql.Query(sql, [amount,
      mop, status || "PAID", id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Payments not found" });
    }

    res.status(200).json ({
      message: "Payment has been updated",
      affectedRows: result.affectedRows,
      data: result
    });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Duplicated Entry",
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


// SOFT DELETE
router.put("/delete", async (req, res)=> {
  try {
   
    if(!req.user?.id) {
      return res.status(401).json({
        message: "Authentication required (Bearer token)"
      });
    }

    const { id } = req.body;

    // VALIDATION
    if (!id || isNaN(id)) {
      return res.status(400).json ({
        message: "Valid ID required"
      });
    }

    const sql = `
    UPDATE master_payment
    SET mp_status = "CANCELLED"
    WHERE mp_id = ?`;

    const result = await mysql.Query(sql, [ id ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Payments not found" });
    }

    res.status(200).json ({
      message: "Payment has been soft deleted",
      affectedRows: result.affectedRows,
      data: result
    });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Duplicated Entry",
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

module.exports = router;