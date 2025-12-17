var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

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

// middleware
app.use(session({
  secret: '1234',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/memberships', membershipsRouter);
app.use('/admin', adminRouter);
app.use('/attendance', attendanceRouter);
app.use('/auth', authRouter);
app.use('/equipment', equipmentRouter);
app.use('/payments', paymentsRouter);
app.use('/rewards', rewardsRouter);
app.use('/sessions', sessionsRouter);
app.use('/vouchers', vouchersRouter);

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
