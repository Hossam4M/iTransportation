// express init
const express = require('express');
const server = express();

// Startup database connection
const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/itransportation');
mongoose.connect('mongodb://admin:admin1234@ds233531.mlab.com:33531/itransportation');
require("./models/cars");
require("./models/drivers");
require("./models/rides");
require("./models/promos");

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

server.use('/admin/dashboard',authMid);
server.use('/admin/list',authMid);
server.use('/admin/ride',authMid);
server.use('/drivers',authMid);
server.use('/promos/add',authMid);
server.use('/promos/list',authMid);
server.use('/cars',authMid);

// Send SMS
// const twilioNumber = 'your-twilio-number';
// const accountSid = 'AC7d96ba0e7032a9eb8e7d9ed59ed847e3';
// const authToken = '5db456584cb4529350d4c4766ecdfd9c';
//
// const client = require('twilio')(accountSid, authToken);
//
// client.messages
//   .create({
//      body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
//      from: '+15017122661',
//      to: '+201004881205'
//    })
//   .then(message => console.log(message.sid))
//   .done();


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
