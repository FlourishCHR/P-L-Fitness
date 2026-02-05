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

// Initialize MySQL connection
mysql.CheckConnection();

var adminRouter = require('./routes/admin.routes.js');
var achievementRouter = require('./routes/achievements.routes.js');
var attendanceRouter = require('./routes/attendance.routes.js');
var authRouter = require('./routes/auth.routes.js');
var equipmentRouter = require('./routes/equipment.routes.js')
var indexRouter = require('./routes/index');
var membershipsRouter = require('./routes/memberships.routes.js');
var paymentsRouter = require('./routes/payments.routes.js');
var productCategoryRouter = require('./routes/product-category.routes.js');
var productsRouter = require('./routes/products.routes.js');
var rankRouter = require('./routes/rank.routes.js');
var experienceRouter = require('./routes/experience.routes.js');
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
app.use('/product-categories', auth, productCategoryRouter);
app.use('/products', auth, productsRouter);
app.use('/ranks', auth, rankRouter);
app.use('/experience', auth, experienceRouter);
app.use('/achievements', auth, achievementRouter);
app.use('/sessions', auth, sessionsRouter);
app.use('/attendance', auth, attendanceRouter);
app.use('/vouchers', auth, vouchersRouter);
app.use('/rewards', auth, rewardsRouter);
app.use('/equipment', auth, equipmentRouter);


// TODO: CRON POINTS EXPIRY (?) not sure yet.


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
