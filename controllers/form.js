const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const urlEncodedMid = bodyParser.urlencoded();
const path = require('path');

const mongoose = require('mongoose');
const carModel = mongoose.model('cars');
const rideModel = mongoose.model('rides');

// nodemailer configuration
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const fs = require('fs');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
      user: 'hosstestmina@gmail.com', // generated ethereal user
      pass: 'test123456$' // generated ethereal password
  },
  tls: {rejectUnauthorized: false}
});

// first step
router.get('/newRide/1',function(request,response){
  response.render('form/firstStep');
});

router.post('/newRide/1',urlEncodedMid,function(request,response){
  let rideInfo = {
    serviceType:request.body.serviceType,
    pDate:request.body.pDate,
    pTime:request.body.pTime,
    pLocation:request.body.pLocation,
    dLocation:request.body.dLocation,
    distance:parseFloat(request.body.distance),
    stops:request.body.stops,
    numberOfPersons:request.body.numberOfPersons,
    numberOfLuggage:request.body.numberOfLuggage,
    handicap:request.body.handicap||'false',
    childSeat:{
      type:request.body.childSeatType,
      number:request.body.childSeatNumber
    }
  }

  request.session.rideInfo = rideInfo;
  response.redirect('/form/newRide/2');
});



// second step
router.get('/newRide/2',function(request,response){
  let rideInfoData = request.session.rideInfo;
  let cars = carModel.find({},(err,cars)=>{
    response.render('form/secondStep',{
      cars,rideInfoData,
    });
  });
});

router.post('/newRide/2',urlEncodedMid,function(request,response){

  let carsDB = carModel.find({'model':request.body.model},(err,cars)=>{
    request.session.carInfo = cars[0];

    let perMile = parseFloat(request.session.carInfo.charge.perMile.main) * parseFloat(request.session.rideInfo.distance);

    let vehicleFee = parseFloat(request.session.carInfo.charge.vehicleFee);

    let totalCost = perMile + vehicleFee;
    request.session.cost = totalCost;

    response.redirect('/form/newRide/3');
  });
});


// third sterp
router.get('/newRide/3',urlEncodedMid,function(request,response){

  let carInfoData = request.session.carInfo;
  let rideInfoData = request.session.rideInfo;
  let cost = request.session.cost;

  response.render('form/ThirdStep',{
    carInfoData,rideInfoData,cost
  });
});

router.post('/newRide/3',urlEncodedMid,function(request,response){
  let clientInfo = {
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
  }

  // random number from 10000 to 19999
  let confirmation = Math.floor((Math.random() * 99999) + 10000);

  request.session.confirmation = confirmation;
  console.log(request.session.carInfo);

  // cost details
  let perMile = parseFloat(request.session.carInfo.charge.perMile.main) * parseFloat(request.session.rideInfo.distance);

  let vehicleFee = parseFloat(request.session.carInfo.charge.vehicleFee);

  let cost = {
    perMile,
    vehicleFee,
    discount:0,
    others:0
  }

  let ride = new rideModel({
      rideInfo : request.session.rideInfo,
      car : request.session.carInfo._id,
      customerInfo : clientInfo,
      comment : request.body.comment,
      status : 'pending',
      totalCost : request.session.cost,
      cost,
      confirmation
  });

  let passenger = clientInfo.lastname + ',' + clientInfo.firstname;

  ride.save(function(err,doc){
      if(!err){
        // calling sendMail function
        sendMail({
          email:clientInfo.email,
          serviceType:ride.rideInfo.serviceType,
          totalCost:request.session.cost,
          name:passenger,
          date:ride.rideInfo.pDate,
          time:ride.rideInfo.pDate,
          pLocation:ride.rideInfo.pLocation,
          dLocation:ride.rideInfo.dLocation,
          confirmation,
          cost
        });

        response.redirect('/form/newRide/4');

      }else{
          response.json(err);
      }
  });
});


// confirmation code and mail transmission
router.get('/newRide/4',function (request,response) {
  let confirmation = request.session.confirmation;
  response.render('form/confirm',{
    confirmation
  });
});

function sendMail(mailData) {
  let data = fs.readFileSync('views/mail/confirmation.ejs','utf-8')
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
}


module.exports = router;
