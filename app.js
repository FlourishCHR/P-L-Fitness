var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const auth = require('./middleware/auth');
const cron = require('node-cron');
const mysql = require('./services/dbconnect.js');
const rateLimit = require('express-rate-limit')
require('dotenv').config();

var adminRouter = require('./routes/admin.routes.js');
var attendanceRouter = require('./routes/attendance.routes.js');
var authRouter = require('./routes/auth.routes.js');
var equipmentRouter = require('./routes/equipment.routes.js')
var indexRouter = require('./routes/index');
var membershipsRouter = require('./routes/memberships.routes.js');
var paymentsRouter = require('./routes/payments.routes.js');
var rewardsRouter = require('./routes/rewards.routes.js');
var sessionsRouter = require('./routes/sessions.routes.js');
var usersRouter = require('./routes/users.routes.js');
var vouchersRouter = require('./routes/vouchers.routes.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views', 'layout'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// RATE LIMIT
app.use('/auth/login', rateLimit({
  windowMs: 5 * 60 * 1000,   // 5 MINS
  max: 5,                    // 5 ATTEMPTS PER IP
  message: "Too many login attempts. Try again in 5 minutes."
}));


// PUBLIC ROUTES
app.use('/auth', authRouter); //LOGIN
app.use('/', indexRouter); // LANDING PAGE
// app.use('/admin', adminRouter); // FOR SEEDED ADMIN
// app.use('/users', usersRouter);


// PROTECTED ROUTES
app.use('/admin', auth, adminRouter);
app.use('/users', auth, usersRouter);
app.use('/memberships', auth, membershipsRouter);
app.use('/payments', auth, paymentsRouter);
app.use('/sessions', auth, sessionsRouter);
app.use('/attendance', auth, attendanceRouter);
app.use('/vouchers', auth, vouchersRouter);
app.use('/rewards', auth, rewardsRouter);
app.use('/equipment', auth, equipmentRouter);


// CRON POINTS EXPIRY (?) not sure yet. old code. havent started.
// cron.schedule('0 0 * * 0', async()=>{
//   try {
    
//     const weeklyPoints = await mysql.Query(`
//       SELECT
//         ma_userId,
//         SUM(ma_pointsEarned) as total_weekly_points,
//         LEAST(SUM(ma_pointsEarned), 600) as capped_points
//       FROM master_attendance
//       WHERE YEARWEEK(ma_checkout) = YEARWEEK(DATE_SUB(NOW(), INTERVAL 1 WEEK))
//       AND ma_pointsEarned > 0
//       AND ma_deleted = 0
//       GROUP BY ma_userId
//       HAVING capped_points > 0`);

//     for (const user of weeklyPoints) {
//       await mysql.Query(`
//         INSERT INTO master_reward_point 
//           (mrp_userId,
//           mrp_pointsAdded,
//           mrp_source)
//         VALUES (?, ?, 'WEEKLY_REWARD')`, [user.ma_userId, user.capped_points]);
//     }
//     console.log(`Weekly rewards added: ${weeklyPoints.length} users,
//       ${weeklyPoints.reduce((sum, u)=> sum + u.capped_points, 0)} total points`);

//   } catch (error) {
//     console.error("CRON Failed: ", error);
//   }
// });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
