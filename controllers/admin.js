const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const urlEncodedMid = bodyParser.urlencoded();

const mongoose = require('mongoose');
let ObjectId = require('mongoose').Types.ObjectId;
const rideModel = mongoose.model('rides');
const carModel = mongoose.model('cars');
const driverModel = mongoose.model('drivers');
const adminModel = mongoose.model('admins');
const addonsModel = mongoose.model('addons');

const fs = require('fs');
const ejs = require('ejs');

const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  // service : 'gmail',
  port: 465,
  secure: true, // use SSL
  auth: {
      user: 'hosstestmina', // generated ethereal user
      pass: 'test123456$' // generated ethereal password
  },
  tls: {rejectUnauthorized: false}
});

// Authentication
router.get('/auth',function(request,response){
  var message = request.flash('message');
  response.render('auth/login',{
      msg:message
  });
});

router.post('/auth',urlEncodedMid,function(request,response){

  let adminDB = adminModel.findOne({},function(err,doc){

    if (request.body.username == doc['username'] && request.body.password == doc['password']) {
      request.session.loggedIn = true;
      response.redirect('/admin/dashboard');
    } else {
      request.flash("message"," not authorized !  invalid username or password");
      response.redirect('/admin/auth');
    }

  });

});

// dashbord for administrator
router.get('/dashboard',(request,response)=>{
  let ridesDB = rideModel.find().populate('car').exec(function(err,docs){
    response.render('admin/dashboard',{
      rides : docs,
    });
  });
});

// listing details of ride
router.get('/list/:id',(request,response)=>{
  let ridesDB = rideModel.find({'_id':request.params.id}).populate('car').exec(function(err,docs){
    response.render('admin/list',{
      ride : docs[0]
    });
  });
});

router.post('/list/:id',urlEncodedMid,(request,response)=>{

  let rideDB = rideModel.findOne({'_id':new ObjectId(request.params.id)},(err,doc)=>{
    doc['rideInfo'] = {
      serviceType:request.body.serviceType,
      pDate:request.body.pDate,
      pTime:request.body.pTime,
      pLocation:request.body.pLocation,
      stops:request.body.stop,
      dLocation:request.body.dLocation,
      distance:request.body.distance,
      numberOfPersons:request.body.numberOfPersons,
      numberOfLuggage:request.body.numberOfLuggage,
      handicap:request.body.handicap == 'Approved' ? 'Approved' : 'Rejected',
    };
    doc['car'] = request.body.carId;
    doc['customerInfo'] = {
      firstname:request.body.firstname,
      lastname:request.body.lastname,
      email:request.body.email,
      mobileNumber:request.body.mobileNumber,
      creditCard:{
        number:request.body.number,
        holder:request.body.holder,
        eDate:request.body.eDate,
        cvc:request.body.cvc
      }
    };
    doc['status'] = request.body.status;
    doc['comment'] = request.body.comment;
    doc['cost'] = {
      perMile:parseFloat(request.body.costPerMile),
      vehicleFee:parseFloat(request.body.costVehicleFee),
      discount:parseFloat(request.body.discount),
      earlyMorning:parseFloat(request.body.earlyCharge),
      stops:parseFloat(request.body.stopCharge),
      childSeats:parseFloat(request.body.childCharge)
    };
    doc['driver'] = request.body.driver;
    doc['totalCost'] = request.body.totalCost;
    doc['confirmation'] = request.body.confirmation;
    doc.save((err)=>{
      if(request.body.sendFlag == "send"){
        sendMail({
          timeStamp:new Date(),
          email:request.body.email,
          serviceType:request.body.serviceType,
          totalCost:request.body.totalCost,
          name:request.body.firstname + " " + request.body.firstname,
          date:request.body.pDate,
          time:request.body.pTime,
          pLocation:request.body.pLocation,
          dLocation:request.body.dLocation,
          costDetails : doc['cost'],
          confirmation : request.body.confirmation,
          cost : doc['cost'],
        });
        
        sendMail({
          timeStamp:new Date(),
          email:'josephrefaat@gmail.com',
          serviceType:request.body.serviceType,
          totalCost:request.body.totalCost,
          name:request.body.firstname + " " + request.body.firstname,
          date:request.body.pDate,
          time:request.body.pTime,
          pLocation:request.body.pLocation,
          dLocation:request.body.dLocation,
          costDetails : doc['cost'],
          confirmation : request.body.confirmation,
          cost : doc['cost'],
        });
        
      }
    });
    response.redirect('/admin/dashboard');
  });

});

function sendMail(mailData) {
  fs.readFile('views/mail/confirmation.ejs','utf-8',(err,data)=>{
    let mainOptions = {
      to: mailData.email,
      subject: 'iTransportation Automated Mail',
      html: ejs.render(data, mailData)
    };
    transporter.sendMail(mainOptions, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log('Message sent: ' + info.response);
      }
    });
  });

}

// update list
router.post('/ride/update',urlEncodedMid,(request,response)=>{

  let data = request.body;

  rideModel.findOne({'_id':new ObjectId(data.id)},(err,doc)=>{
    if (data.fieldParent) {
      doc[data.fieldParent][data.fieldMain] = data.input;
    } else {
      doc[data.fieldMain] = data.input;
    }
    doc.save();
    response.send({});
  });
});

// delete Ride
router.get('/ride/delete/:id',urlEncodedMid,(request,response)=>{
  rideModel.remove({'_id':new ObjectId(request.params.id)},(err)=>{
    if(!err){
      response.send({});
    } else {
      response.json(err);
    }

  });
});

router.post('/ride/status',urlEncodedMid,(request,response)=>{

  let data = request.body;

  rideModel.findOne({'_id':new ObjectId(data.id)},(err,doc)=>{
    doc[data.fieldMain] = data.input;
    doc.save();
    response.send({});
  });
});

router.post('/ride/cost',urlEncodedMid,(request,response)=>{

  let data = request.body;

  rideModel.findOne({'_id':new ObjectId(data.id)},(err,doc)=>{
    doc['cost'] = data.cost;
    doc['totalCost'] = data.totalCost;
    doc.save();
    response.send({});
  });
});

router.post('/ride/driver',urlEncodedMid,(request,response)=>{

  let data = request.body;

  driverModel.findOne({'car':new ObjectId(data.id)},(err,doc)=>{
    let name = doc.firstname + ',' + doc.lastname + ',' +doc.username;
    response.send({
      name
    });
  });

})

// visis website
router.get('/endUser',(request,response)=>{
  response.redirect('/form/newRide/1');
});

// logOut
router.get('/logout',(request,response)=>{
  request.session.loggedIn = false;
  response.redirect('/admin/auth');
});

// Credentials
router.get('/credential',(request,response)=>{
  response.render('auth/change');
});

router.post('/credential',urlEncodedMid,(request,response)=>{
  let adminDB = adminModel.findOne({},function(err,doc){
    doc['username'] = request.body.username;
    doc['password'] = request.body.password;
    doc.save();
    request.session.loggedIn = false;
    response.redirect('/admin/auth');
  });
});

router.get('/addons',(request,response)=>{
  addonsModel.find({},(err,docs)=>{
    response.render('admin/addons',{
      addons:docs[0]
    });
  });
});

router.post('/addons',urlEncodedMid,(request,response)=>{
  addonsModel.findOne({},(err,doc)=>{
    doc['stop'] = parseFloat(request.body.stop);
    doc['child'] = parseFloat(request.body.child);
    doc['earlyMorning'] = parseFloat(request.body.earlyMorning);
    doc.save();
    response.redirect('/admin/dashbord');
  });
});


module.exports = router;
