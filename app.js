var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const auth = require('./middleware/auth');
require('dotenv').config();
const cron = require('node-cron');
const mysql = require('./services/dbconnect.js');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var membershipsRouter = require('./routes/memberships');
var adminRouter = require('./routes/admin');
var attendanceRouter = require('./routes/attendance');
var authRouter = require('./routes/auth');
var equipmentRouter = require('./routes/equipment');
var paymentsRouter = require('./routes/payments');
var rewardsRouter = require('./routes/rewards');
var sessionsRouter = require('./routes/sessions');
var vouchersRouter = require('./routes/vouchers');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views', 'layout'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// public routes
app.use('/auth', authRouter); //LOGIN
app.use('/', indexRouter); // LANDING PAGE
// app.use('/admin', adminRouter); // FOR SEEDED ADMIN
// app.use('/users', usersRouter);


// protected routes
app.use('/admin', auth, adminRouter);
app.use('/users', auth, usersRouter);
app.use('/memberships', auth, membershipsRouter);
app.use('/payments', auth, paymentsRouter);
app.use('/sessions', auth, sessionsRouter);
app.use('/attendance', auth, attendanceRouter);
app.use('/vouchers', auth, vouchersRouter);
app.use('/rewards', auth, rewardsRouter);
app.use('/equipment', auth, equipmentRouter);

// DAILY POINT IN ATTENDANCE RESET => PASS POINTS TO REWARD POINTS
// cron.schedule('0 0 * * *', async () => {
//   try {
//     console.log ('Daily points reset STARTED');
//     await mysql.Query('TRUNCATE TABLE master_reward_points');
//     console.log("Daily points reset COMPLETE");
//   } catch (error) {
//     console.error("RESET FAILED: ", error);
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
