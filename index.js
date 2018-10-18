// express init
const express = require('express');
const server = express();

// Startup database connection
const mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/itransportation');
mongoose.connect('mongodb://admin:admin1234@ds233531.mlab.com:33531/itransportation');

require("./models/cars");
require("./models/drivers");
require("./models/rides");
require("./models/admins");
require("./models/promos");
require("./models/addons");

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
  res.locals.rideInfo = req.session.rideInfo;
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

server.use('/admin/dashboard',authMid);
server.use('/admin/addons',authMid);
server.use('/admin/credential',authMid);
server.use('/admin/list',authMid);
server.use('/admin/ride',authMid);
server.use('/admin/endUser',authMid);
server.use('/admin/logout',authMid);
server.use('/drivers',authMid);
server.use('/promos/add',authMid);
server.use('/promos/list',authMid);
server.use('/cars',authMid);


// routers
const adminRouter = require('./controllers/admin.js');
server.use('/admin',adminRouter);

const driversRouter = require('./controllers/drivers.js');
server.use('/drivers',driversRouter);

const carsRouter = require('./controllers/cars.js');
server.use('/cars',carsRouter);

const promosRouter = require('./controllers/promos.js');
server.use('/promos',promosRouter);


const formRouter = require('./controllers/form.js');
server.use('/form',formRouter);


// server configuration
var port = process.env.PORT || 9000;
server.listen(port);
