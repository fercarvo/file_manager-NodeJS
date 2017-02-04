var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var formidable = require('formidable');
var mongoose = require('mongoose');
var fs = require("fs");



mongoose.Promise = global.Promise; //esta linea es porque salia un advertencia de monggose

mongoose.connect('mongodb://admin:admin@localhost:27017/admin', function(err, db){
//mongoose.connect('mongodb://user:1991@ds127949.mlab.com:27949/sdistribuidos', function(err, db){

//mongoose.connect('mongodb://user:1991@ds127949.mlab.com:27949/sdistribuidos', function(err, db){
  if (err) {
    console.log(err);
    console.log("\nPLEASE RESTART THE SERVER OR CHECK CONNECTION\n");
  }else{
    console.log("Conexion existosa");
  }
});


require('./models/File');

var index = require('./routes/index');
var users = require('./routes/users');
var uploaderRoutes = require('./routes/uploader');
var app = express();

//app.use(busboy());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/', uploaderRoutes);

// catch 404 and forward to error handler
app.use(function(req, res) {
  res.status(404);
  res.send({ error: "404", message: "Resource/page not found" });
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
