var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
const cors = require('cors');
// Express Prometheus Middelware
const promMid = require('express-prometheus-middleware');

// Set up the db
const db = require('./models/db');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/usersRoutes');
var weatherRouter = require('./routes/weatherRoutes');

var app = express();
const corsOptions = {
  origin: process.env.FRONTEND_URL, // Adjust to your frontend's origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
  allowedHeaders: ['Content-Type'], // Headers allowed in requests
  credentials: true, // Allow cookies or Authorization headers
};

// Configure Prometheus middleware for metrics collection

app.use(promMid({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 3, 5, 10],
  /**
   * Uncomenting the `authenticate` callback will make the `metricsPath` route
   * require authentication. This authentication callback can make a simple
   * basic auth test, or even query a remote server to validate access.
   * To access /metrics you could do:
   * curl -X GET user:password@localhost:9091/metrics
   */
  // authenticate: req => req.headers.authorization === 'Basic dXNlcjpwYXNzd29yZA==',
  /**
   * Uncommenting the `extraMasks` config will use the list of regexes to
   * reformat URL path names and replace the values found with a placeholder value
  */
  // extraMasks: [/..:..:..:..:..:../],
  /**
   * The prefix option will cause all metrics to have the given prefix.
   * E.g.: `app_prefix_http_requests_total`
   */
  // prefix: 'app_prefix_',
  /**
   * Can add custom labels with customLabels and transformLabels options
   */
  // customLabels: ['contentType'],
  // transformLabels(labels, req) {
  //   // eslint-disable-next-line no-param-reassign
  //   labels.contentType = req.headers['content-type'];
  // },
 }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Allow the server to access and serve all the frontend sattic files
app.use(express.static(path.join(__dirname, '../../frontend/meteo-frontend')));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight requests

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/weather', weatherRouter);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/meteo-frontend/index.html'));
});


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
