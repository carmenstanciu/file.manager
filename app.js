require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const hbs = require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const chalk = require('chalk');

const dbConnect = require('./data');
const fileUpload = require('express-fileupload');
const moment = require('moment');

const auth = require('./helpers/auth');

dbConnect(process.env.DB_CONNECTION_STRING);

const app = express();
const packagejson = require('./package.json');
console.log(chalk.bold.green(`Started ${packagejson.name} PORT ${process.env.PORT || 3000} NODE_ENV ${app.get('env')}`));

//session
let session = require('express-session');
let mongoStore = require('connect-mongo')(session);
app.use(session({
  resave: true,
  rolling: true,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET,
  store: new mongoStore({
    url: process.env.DB_CONNECTION_STRING
  }),
  maxAge: 1000 * 60 * 60,
  cookie: {
    maxAge: 1000 * 60 * 60
  }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: null,
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'
}));
app.set('view engine', 'hbs');

app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', auth, (req, res, next) => {
  let urlArr = req.originalUrl.split('/');
  if (urlArr.length !== 4 || urlArr[2] !== req.session.userid)
    return res.redirect('/');
  return next();
}, express.static(path.join(__dirname, 'uploads')));

app.use('/', require('./routes/index'));
app.use('/account', require('./routes/account'));
app.use('/user', require('./routes/user'));
app.use('/folder', require('./routes/folder'));
app.use('/file', require('./routes/file'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
