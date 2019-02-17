const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const urlEncodedMid = bodyParser.urlencoded();
const path = require('path');

const mongoose = require('mongoose');
const carModel = mongoose.model('cars');
const rideModel = mongoose.model('rides');
const addonsModel = mongoose.model('addons');

// nodemailer configuration
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const fs = require('fs');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  // service : 'gmail',
  port: 465,
  secure: true, // use SSL
  auth: {
      user: 'itransportationreservations', // generated ethereal user
      pass: 'JOEhosam' // generated ethereal password
  },
  tls: {rejectUnauthorized: false}
});

const confirmationList = [33000];

// retrieve addons charge
let addons_charges = [];
let addonsDB = addonsModel.findOne({},(err,doc)=>{
  addons_charges[0] = doc['stop'];
  addons_charges[1] = doc['child'];
  addons_charges[2] = doc['earlyMorning'];
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

  let stopsCost = 0 , childCost = 0 , earlyMorningCost = 0

  // stop Cost
  if (rideInfo.stops) {
    if (Array.isArray(rideInfo.stops)) {
      stopsCost = rideInfo.stops.length * addons_charges[0]
    } else {
      stopsCost = addons_charges[0]
    }
  }

  // child seat cost
  if (rideInfo.childSeat.number) {
    if (Array.isArray(rideInfo.childSeat.number)) {
      function getSum(total, num) {
      	num = parseInt(num);
        return parseInt(total) + num;
      }
      let childSeatNo = rideInfo.childSeat.number.reduce(getSum);
      childCost = childSeatNo * addons_charges[1];
    } else {
      childCost = parseInt(rideInfo.childSeat.number) * addons_charges[1]
    }
  }

  // earlyMorning cost
  let arr = rideInfo.pTime.split(" ");
  if (arr[3] == 'AM' && (parseInt(arr[0]) < 4 || parseInt(arr[0]) == 12) ) {
    earlyMorningCost = addons_charges[2]
  }

  request.session.costDetails = {
    stopsCost,childCost,earlyMorningCost
  }

  console.log(request.session.costDetails);

  request.session.rideInfo = rideInfo;

  response.redirect('/form/newRide/2');
});



// second step
router.get('/newRide/2',function(request,response){
  let rideInfoData = request.session.rideInfo;
  let costDetails = request.session.costDetails;

  let cars = carModel.find({}).sort('order').exec(function(err,cars){
    response.render('form/secondStep',{
      cars,rideInfoData,costDetails
    });
  });
});

router.post('/newRide/2',urlEncodedMid,function(request,response){

  let carsDB = carModel.find({'model':request.body.model},(err,cars)=>{
    request.session.carInfo = cars[0];

    let perMile = parseFloat(request.session.carInfo.charge.perMile.main) * parseFloat(request.session.rideInfo.distance);

    let vehicleFee = parseFloat(request.session.carInfo.charge.vehicleFee);

    let extraCharge = request.session.costDetails.stopsCost + request.session.costDetails.childCost + request.session.costDetails.earlyMorningCost

    let totalCost = (perMile + vehicleFee + extraCharge).toFixed(2);
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
  }

  request.session.clientInfo = clientInfo;

  response.redirect('/form/newRide/3/extend');

});


// step 3 extended
router.get('/newRide/3/extend',function(request,response){

  let carInfoData = request.session.carInfo;
  let rideInfoData = request.session.rideInfo;
  let clientInfoData = request.session.clientInfo;
  let costDetails = request.session.costDetails
  let cost = request.session.cost;

  response.render('form/ThirdStep_ext',{
    carInfoData,rideInfoData,clientInfoData,cost,costDetails
  });
});


router.post('/newRide/3/extend',urlEncodedMid,function(request,response){

  let creditDetails = {};

  if (request.body.number && request.body.holder &&  request.body.eDate && request.body.cvc && request.body.creditStatus) {
    creditDetails = {
      number:request.body.number,
      holder:request.body.holder,
      eDate:request.body.eDate,
      cvc:request.body.cvc,
      status:request.body.creditStatus
    }
  }

  let clientInfo = {
    firstname:request.body.firstname,
    lastname:request.body.lastname,
    email:request.body.email,
    mobileNumber:request.body.mobileNumber,
    creditCard:creditDetails
  }

  request.session.clientInfo = clientInfo;

  // random number starting from 330000
  let confirmation = confirmationList[confirmationList.length - 1];
  confirmationList.push(confirmation + 1);

  request.session.confirmation = confirmation;

  // cost details
  let perMile = parseFloat(request.session.carInfo.charge.perMile.main) * parseFloat(request.session.rideInfo.distance);

  let vehicleFee = parseFloat(request.session.carInfo.charge.vehicleFee);

  let cost = {
    perMile,
    vehicleFee,
    discount : request.body.discount ? parseInt(request.body.discount) : 0,
    childSeats : request.session.costDetails.childCost,
    earlyMorning : request.session.costDetails.earlyMorningCost,
    stops : request.session.costDetails.stopsCost,
  }

  let flightDetails = {};

  if (request.body.airline_name && request.body.flightNo) {
    flightDetails.pickUp = {
      airline : request.body.airline_name,
      number : request.body.flightNo
    }
  }

  let ride = new rideModel({
      rideInfo : request.session.rideInfo,
      car : request.session.carInfo._id,
      customerInfo : clientInfo,
      comment : request.body.comment,
      status : 'pending',
      totalCost : request.session.cost,
      flightDetails,
      cost,
      confirmation,
  });

  let passenger = clientInfo.lastname + ',' + clientInfo.firstname;

  ride.save(function(err,doc){
      if(!err){
        // calling sendMail function
        sendMail({
          timeStamp:new Date(),
          email:clientInfo.email,
          serviceType:ride.rideInfo.serviceType,
          totalCost:request.session.cost,
          name:passenger,
          date:ride.rideInfo.pDate,
          time:ride.rideInfo.pDate,
          pLocation:ride.rideInfo.pLocation,
          dLocation:ride.rideInfo.dLocation,
          costDetails : request.session.costDetails,
          confirmation,
          cost
        });
        
        sendMail({
          timeStamp:new Date(),
          email:'josephrefaat@gmail.com',
          serviceType:ride.rideInfo.serviceType,
          totalCost:request.session.cost,
          name:passenger,
          date:ride.rideInfo.pDate,
          time:ride.rideInfo.pDate,
          pLocation:ride.rideInfo.pLocation,
          dLocation:ride.rideInfo.dLocation,
          costDetails : request.session.costDetails,
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


////////////////////// return service ////////////////////////

// first step
router.get('/returnRide/1',function(request,response){
  response.render('return/firstStep',{
    rideInfo : request.session.rideInfo
  });
});

router.post('/returnRide/1',urlEncodedMid,function(request,response){
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

  let stopsCost = 0 , childCost = 0 , earlyMorningCost = 0

  // stop Cost
  if (rideInfo.stops) {
    if (Array.isArray(rideInfo.stops)) {
      stopsCost = rideInfo.stops.length * addons_charges[0]
    } else {
      stopsCost = addons_charges[0]
    }
  }

  // child seat cost
  if (rideInfo.childSeat.number) {
    if (Array.isArray(rideInfo.childSeat.number)) {
      function getSum(total, num) {
      	num = parseInt(num);
        return parseInt(total) + num;
      }
      let childSeatNo = rideInfo.childSeat.number.reduce(getSum);
      childCost = childSeatNo * addons_charges[1];
    } else {
      childCost = parseInt(rideInfo.childSeat.number) * addons_charges[1]
    }
  }

  // earlyMorning cost
  let arr = rideInfo.pTime.split(" ");
  if (arr[3] == 'AM' && (parseInt(arr[0]) < 4 || parseInt(arr[0]) == 12) ) {
    earlyMorningCost = addons_charges[2]
  }

  request.session.costDetails = {
    stopsCost,childCost,earlyMorningCost
  }

  request.session.rideInfo = rideInfo;
  response.redirect('/form/returnRide/2');
});



// second step
router.get('/returnRide/2',function(request,response){
  let rideInfoData = request.session.rideInfo;
  let costDetails = request.session.costDetails;

  let cars = carModel.find({}).sort('order').exec(function(err,cars){
    response.render('form/secondStep',{
      cars,rideInfoData,costDetails
    });
  });

});

router.post('/returnRide/2',urlEncodedMid,function(request,response){

  let carsDB = carModel.find({'model':request.body.model},(err,cars)=>{
    request.session.carInfo = cars[0];

    let perMile = parseFloat(request.session.carInfo.charge.perMile.main) * parseFloat(request.session.rideInfo.distance);

    let vehicleFee = parseFloat(request.session.carInfo.charge.vehicleFee);

    let extraCharge = request.session.costDetails.stopsCost + request.session.costDetails.childCost + request.session.costDetails.earlyMorningCost

    let totalCost = (perMile + vehicleFee + extraCharge).toFixed(2);
    request.session.cost = totalCost;

    response.redirect('/form/returnRide/3');
  });

});


// third sterp
router.get('/returnRide/3',urlEncodedMid,function(request,response){

  let carInfoData = request.session.carInfo;
  let rideInfoData = request.session.rideInfo;
  let clientInfoData = request.session.clientInfo;
  let costDetails = request.session.costDetails
  let cost = request.session.cost;

  response.render('return/ThirdStep',{
    carInfoData,rideInfoData,clientInfoData,cost,costDetails
  });

});

router.post('/returnRide/3',urlEncodedMid,function(request,response){

  let creditDetails = {};

  if (request.body.number && request.body.holder &&  request.body.eDate && request.body.cvc && request.body.creditStatus) {
    creditDetails = {
      number:request.body.number,
      holder:request.body.holder,
      eDate:request.body.eDate,
      cvc:request.body.cvc,
      status:request.body.creditStatus
    }
  }

  let clientInfo = {
    firstname:request.body.firstname,
    lastname:request.body.lastname,
    email:request.body.email,
    mobileNumber:request.body.mobileNumber,
    creditCard:creditDetails
  }

  request.session.clientInfo = clientInfo;

  // random number from 10000 to 19999
  let confirmation = Math.floor((Math.random() * 99999) + 10000);

  request.session.confirmation = confirmation;

  // cost details
  let perMile = parseFloat(request.session.carInfo.charge.perMile.main) * parseFloat(request.session.rideInfo.distance);

  let vehicleFee = parseFloat(request.session.carInfo.charge.vehicleFee);

  let cost = {
    perMile,
    vehicleFee,
    discount : request.body.discount ? parseInt(request.body.discount) : 0,
    childSeats : request.session.costDetails.childSeat,
    earlyMorning : request.session.costDetails.earlyMorningCost,
    stops : request.session.costDetails.stopsCost,
  }


  let flightDetails = {};

  if (request.body.airline_name && request.body.flightNo) {
    flightDetails.pickUp = {
      airline : request.body.airline_name,
      number : request.body.flightNo
    }
  }

  let ride = new rideModel({
      rideInfo : request.session.rideInfo,
      car : request.session.carInfo._id,
      customerInfo : clientInfo,
      comment : request.body.comment,
      status : 'pending',
      totalCost : request.session.cost,
      flightDetails,
      cost,
      confirmation,
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
          costDetails : request.session.costDetails,
          confirmation,
          cost
        });
        
        sendMail({
          timeStamp:new Date(),
          email:'josephrefaat@gmail.com',
          serviceType:ride.rideInfo.serviceType,
          totalCost:request.session.cost,
          name:passenger,
          date:ride.rideInfo.pDate,
          time:ride.rideInfo.pDate,
          pLocation:ride.rideInfo.pLocation,
          dLocation:ride.rideInfo.dLocation,
          costDetails : request.session.costDetails,
          confirmation,
          cost
        });

        response.redirect('/form/returnRide/4');

      }else{
          response.json(err);
      }
  });

});

router.get('/returnRide/4',function (request,response) {
  let confirmation = request.session.confirmation;
  response.render('return/confirm',{
    confirmation
  });
});


module.exports = router;
