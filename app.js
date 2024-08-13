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

app.logger = require("./logger/logger");
// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.http = require("./lib/util/http");
app.util = require("./lib/util/parser");
app.invoke = require("./lib/http/invoke");
require('./routes/csvUpload/index')({ app: app })
require('./routes/tenant/index')({ app: app })
// require("./routes/blob/index")({ app: app });

// cronjob for every 2 minutes
var request = require('request')
var CronJob = require('cron').CronJob;
var PauseCronJob = require('cron').CronJob;
new CronJob('*/3 * * * *', function () {
  try {
    request(process.env.STOP_ENDPOINT, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log('You will see this message every 3 minutes(stop)');
      } else {
        console.log("StopErrorLog====>>>>", error)
      }
    })
  } catch (error) {
    console.log("StopCatchLog====>>>>", error)
  }
}, null, true, "Asia/Calcutta");

new PauseCronJob('*/2 * * * *', function () {
  try {
    request(process.env.PAUSE_ENDPOINT, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log('You will see this message every 2 minutes(pause)');
      } else {
        console.log("PauseErrorLog====>>>>", error)
      }
    })
  } catch (error) {
    console.log("PauseCatchLog====>>>>", error)
  }
}, null, true, "Asia/Calcutta");

// cronjob for every  15 secs.
// new CronJob('*/15 * * * * *', function() {
//     request(process.env.CLOSE_CONEECTION_ENDPOINT, function(error, response, body) {
//         if (!error && response.statusCode == 200) {
//           // console.log('You will see this message every 2 minutes');
//         } else {
//           console.log(error)
//         }
//     })
// }, null, true, "Asia/Calcutta");

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(express.json({ limit: '50mb' })); // Adjust the limit as needed
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
var server = app.listen(3004, function () {
  console.log("sync Service...", 3004)
});
module.exports = app;
