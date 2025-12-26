var express = require('express');
var router = express.Router();
const mysql = require('../services/dbconnect.js');

/* GET ATTENDANCE PAGE. */
router.get('/', function(req, res, next) {
  res.send('ATTENDANCE ROUTER');
});


router.get("/load", async (req, res)=> {
  try {
    
    const sql=`
    SELECT
      ma.ma_id,
      ma.mu_id,
      CONCAT(mu.mu_firstName, ' ', mu.mu_lastName) as memberName,
      ma.ms_id,
      ms.ms_sessionName,
      COALESCE(CONCAT(coach.mu_firstName, ' ', coach.mu_lastName), 'FREE WORKOUT') as coachName,
      ma.ma_checkin,
      ma.ma_checkout,
      ma.ma_duration,
      ma.ma_pointsEarned
    FROM master_attendance ma
    LEFT JOIN master_user mu ON ma.mu_id = mu.mu_id
    LEFT JOIN master_session ms ON ma.ms_id = ms.ms_id
    LEFT JOIN master_user coach on ms.coach_id = coach.mu_id
    WHERE ma.ma_deleted = 0
    ORDER BY ma.ma_checkin DESC
    `;

    const result = await mysql.Query(sql);
    res.status(200).json({
      message: "Success",
      data: result
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching attendance",
      data: error
    });
  };
});


// ATTENDANCE INSERT
router.post("/checkin", async (req, res)=> {
  try {
    
    if (!req.user?.id) {
      return res.status(401).json({
        message: "Authentication required (Bearer token)"
      });
    }

    const { mu_id, ms_id } = req.body;

     // VALIDATION
     if (!mu_id) {
      return res.status(400).json({
        message: "mu_id required"
      });
     }

     const sql = `
     INSERT INTO master_attendance
     (mu_id, ms_id, ma_checkin)
     VALUES (?, ?, NOW())`;

      const result = await mysql.Query(sql, [mu_id, ms_id || null]);
      res.status(201).json ({
        message: "Checkin success",
        data: {ma_id: result.insertId}
      });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Member already checked in",
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


// UPDATE CHECKOUT
router.put("/checkout", async (req, res)=> {
  try {
    
    if (!req.user?.id) {
      return res.status(401).json({
        message: "Authentication required (Bearer token)"
      });
    }

    const { ma_id } = req.body;

    // VALIDATION
    if (!ma_id) {
      return res.status(400).json ({
        message: "ma_id required"
      });
    }

    // GET USER ID FROM ATTENDANCE ID
    const attendance = await mysql.Query(
      `SELECT mu_id FROM master_attendance WHERE ma_id = ?`, [ma_id]
    );
    const mu_id = attendance[0]?.mu_id;

    if (!mu_id) {
      return res.status(404).json({message: "Attendance not found"});
    }

    // CALCULATE DURATION
    const durationRow = await mysql.Query(
      `SELECT TIMESTAMPDIFF(MINUTE, ma_checkin, NOW())
      AS duration FROM master_attendance WHERE ma_id = ?`, [ma_id]
    );
    const duration = durationRow[0]?.duration;

    // DEBUG
    if (duration === null || duration === undefined) {
      res.status(404).json({message: "Invalid attendance record"});
    }

    // CHECK TODAY'S POINTS FROM USER
    const todayTotal = await mysql.Query(
      `SELECT COALESCE(SUM(ma_pointsEarned), 0) AS totalToday
      FROM master_attendance
       WHERE mu_id = ?
       AND ma_checkout IS NOT NULL
       AND DATE(ma_checkout) = CURDATE() 
       AND ma_deleted = 0`,
       [mu_id]
    );
    const pointsEarnedToday = todayTotal[0]?.totalToday;

    // MATH BETWEEN POINTS
    const remainingPoints = 120 - pointsEarnedToday;
    const pointsThisWorkout = Math.min(duration, remainingPoints, 120);

    if (remainingPoints <= 0) {
      return res.status(403).json ({
        message: "Daily points cap (120) reached",
        data: {pointsToday: pointsEarnedToday}
      });
    }

    // INITIALIZE SQL
    const sql =`
    UPDATE master_attendance
      SET
        ma_checkout = NOW(),
        ma_duration = ?,
        ma_pointsEarned = ?
      WHERE ma_id = ?
    `;

    const result = await mysql.Query(sql, [duration, pointsThisWorkout, ma_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({message: "Attendance not found"});
    }

    res.status(200).json ({
      message: "Checkout success",
      affectedRows: result.affectedRows,
      data: {
        ma_id,
        duration_minutes: duration,
        points_earned: pointsThisWorkout,
        pointsToday: pointsEarnedToday + pointsThisWorkout,
        daily_remaining: remainingPoints - pointsThisWorkout
      }
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
    
    if (!req.user?.id) {
      return res.status(401).json({message: "Auth required"});
    }

    const {ma_id} = req.body;
    
    if (!ma_id) {
      return res.status(400).json({message: "ma_id required"});
    }

    const sql =`
    UPDATE master_attendance
    SET ma_deleted = 1
    WHERE ma_id = ?
    `;

    const result = await mysql.Query(sql,[ma_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({message: "Attendance not found"});
    }

    res.status(200).json({
      message: "Attendance deleted successfully",
      data: {ma_id}
    });

  } catch (error) {
    res.status(500).json ({
      message: "Server Error (500)",
      data: error
    });
  }
});

module.exports = router;