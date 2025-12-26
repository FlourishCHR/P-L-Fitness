var express = require('express');
var router = express.Router();
const mysql = require('../services/dbconnect.js');

/* GET SESSIONS PAGE. */
router.get('/', function(req, res, next) {
  res.send('SESSIONS ROUTER');
});


router.get("/load", async (req, res)=> {
  try {
    
    const sql=`
    SELECT
      ms.ms_id,
      ms.coach_id,
      CONCAT(mu.mu_firstName, ' ', mu.mu_lastName) as coachName,
      ms.ms_sessionName,
      ms.ms_datetime,
      ms.ms_capacity,
      ms.ms_status
    FROM master_session ms
    LEFT JOIN master_user mu ON ms.coach_id = mu.mu_id
    -- WHERE mu.mu_status != 'DELETED' -- delete this to see 'DELETED' status
    -- AND mu.mu_status != 'DELETED' -- delete this to see 'DELETED' status
    ORDER BY ms.ms_datetime ASC
    `;

    const result = await mysql.Query(sql);
    res.status(200).json({
      message: "Success",
      data: result
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching sessions",
      data: error
    });
  };
});


// SESSION INSERTION
router.post("/insert", async (req, res)=> {
  try {
    
    if (!req.user?.id) {
      return res.status(401).json({
        message: "Authentication required (Bearer token)"
      });
    }

    const {
      coach_id, sessionName, datetime, capacity
    } = req.body;

    // VALIDATION
    if (!coach_id || !sessionName || !datetime || !capacity) {
      return res.status(400).json ({
        message: "coach_id, sessionName, datetime, capacity required"
      });
    }

    const sql = `
    INSERT INTO master_session
      (coach_id, 
      ms_sessionName,
      ms_datetime,
      ms_capacity,
      ms_status)
    VALUES (?, ?, ?, ?, 'ACTIVE')`;

    const result = await mysql.Query(sql, [coach_id, sessionName,
      datetime, capacity
    ]);
    res.status(201).json ({
      message: "Session created successfully",
      data: result
    });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message:"Duplicated Entry",
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


// SESSION UPDATE
router.put("/update", async (req, res)=> {
  try {
    
    if (!req.user?.id) {
      return res.status(401).json({
        message: "Authentication required (Bearer token)"
      });
    }

    const {
      id, sessionName, datetime, capacity, status
    } = req.body;

    // VALIDATION
    if (!id || !sessionName || !datetime || !capacity ) {
      return res.status(400).json ({
        message: "id, sessionName, datetime, capacity required"
      });
    }

    const sql = `
    UPDATE master_session
      SET ms_sessionName = ?,
      ms_datetime = ?,
      ms_capacity = ?,
      ms_status = COALESCE(?, ms_status)
    WHERE ms_id = ?
    `;

    const result = await mysql.Query(sql, [sessionName,
      datetime, capacity, status, id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json ({
      message: "Session has been updated",
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
    UPDATE master_session
      SET ms_status = 'CANCELLED'
    WHERE ms_id = ?
    `;

    const result = await mysql.Query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Session not found "});
    }

    res.status(200).json ({
      message: "Session has been soft deleted",
      affectedRows: result.affectedRows,
      data: result
    });

  } catch (error) {
    console.error("ERROR DELETE: ", error);
    res.status(500).json ({ message: "Server Error" });
  }
});

module.exports = router;