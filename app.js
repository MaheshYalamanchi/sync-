require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
//global error handling
const errorConfig = require("./configuration/errors");
//configure the engine
const appConfig = require("./configuration/appconfig");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.http = require("./lib/util/http");
app.util = require("./lib/util/parser");
app.invoke = require("./lib/http/invoke");
require('./routes/csvUpload/index')({app:app})
// var request = require('request')
// var CronJob = require('cron').CronJob;
// new CronJob('* * * * *', function() {
    
//     request(process.env.ENDPOINT, function(error, response, body) {
//         if (!error && response.statusCode == 200) {
//           console.log('You will see this message every minute');
//             // console.log(body) // Show the HTML for the Google homepage.
//         }
//     })
// }, null, true, "Asia/Calcutta");
// new CronJob('*/2 * * * *', function() {
    
//   request(process.env.LABEL, function(error, response, body) {
//       if (!error && response.statusCode == 200) {
//         console.log('You will see this message every minute');
//           // console.log(body) // Show the HTML for the Google homepage.
//       }
//   })
// }, null, true, "Asia/Calcutta");

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
var server = app.listen(process.env.PORT, function () {
  console.log("sync Service...",process.env.PORT)
});