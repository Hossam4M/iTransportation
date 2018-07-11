// express init
const express = require('express');
const server = express();

// Startup database connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/itransportation');
require("./models/cars");
require("./models/drivers");
require("./models/rides");

// deployment requirements
const compression = require('compression');
const helmet = require('helmet');
server.use(compression());
server.use(helmet());

// project config
server.set('view engine','ejs');
server.use(express.static('public'));
server.set("views",'./views');

// session options
var session = require('express-session');
var flash = require('connect-flash');
server.use(flash())
server.use(express.static('public'));
server.use(session({
    secret:"$9*445#@0"
}));

// middleware for passing session variables
server.use(function(req, res, next){
  res.locals.loggedIn = req.session.loggedIn;
  next();
});

// middleware for authentication
function authMid(request,response,next) {
  if (request.session.loggedIn) {
    next();
  } else {
    response.redirect('/admin/auth');
  }
}

server.use('/admin/list',authMid);
server.use('/admin/ride',authMid);
server.use('/drivers',authMid);
server.use('/cars',authMid);

// routers
const adminRouter = require('./controllers/admin.js');
server.use('/admin',adminRouter);

const driversRouter = require('./controllers/drivers.js');
server.use('/drivers',driversRouter);

const carsRouter = require('./controllers/cars.js');
server.use('/cars',carsRouter);

const formRouter = require('./controllers/form.js');
server.use('/form',formRouter);


// server configuration
var port = process.env.PORT || 9000;
server.listen(port);

// API consuming
// Request.get("http://localhost:9090/", (error, response, body) => {
//     if(error) {
//         return console.dir(error);
//     }
//     let data = JSON.parse(body);
//     console.log(data.user);
// });
