var createError = require('http-errors');
var express = require('express');
const fileUpload = require('express-fileupload');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var fs = require('fs');

var dir = path.join(__dirname, 'public');

mongoose.connect('mongodb://localhost:27017/music', { useNewUrlParser: true })
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));

var apiRouter = require('./routes/book');
var app = express();
//fileupload
var storage =  multer.diskStorage({
  destination: function (req, file, cb) {
      cb (null, './public/images');
  },
  filename: function (req, file, cb) {
      // var datetimestamp = Date.now();
      // cb (null, (file.originalname + 'datetimestamp'));
      if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
        var err = new Error();
        err.code = 'filetype';
        return cb(err);
      } else {
          cb(null, file.originalname);
      }
  }
});
app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.append('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

var upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 }
}).single('myFile');


// app.use(fileUpload());

app.post('/upload', function (req, res) {
  upload(req, res, function(err) {
      if (err) {
          res.json({ error_code: 1, err_desc: err });
          return;
      }     
      res.json({ "image_url": "http://localhost:3000/images/" + req.file.originalname });
  });
});

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'dist/mean-angular6')));
app.use('/', express.static(path.join(__dirname, 'dist/mean-angular6')));
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


var mime = {
  html: 'text/html',
  txt: 'text/plain',
  css: 'text/css',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  js: 'application/javascript'
};
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  var reqpath = req.url.toString().split('?')[0];
  if (req.method !== 'GET') {
      res.statusCode = 501;
      res.setHeader('Content-Type', 'text/plain');
      return res.end('Method not implemented');
  }
  var file = path.join(dir, reqpath.replace(/\/$/, '/index.html'));
  if (file.indexOf(dir + path.sep) !== 0) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'text/plain');
      return res.end('Forbidden');
  }
  var type = mime[path.extname(file).slice(1)] || 'text/plain';
  var s = fs.createReadStream(file);
  s.on('open', function () {
      res.setHeader('Content-Type', type);
      s.pipe(res);
  });
  s.on('error', function () {
      res.setHeader('Content-Type', 'text/plain');
      res.statusCode = 404;
      res.end('Not found');
  });

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.sendStatus(err.status);
});

///sssssss


/////eeeeeee
app.listen(3000);
module.exports = app;
