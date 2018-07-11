const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const urlEncodedMid = bodyParser.urlencoded();

const mongoose = require('mongoose');
let ObjectId = require('mongoose').Types.ObjectId;
const rideModel = mongoose.model('rides');
const carModel = mongoose.model('cars');
const driverModel = mongoose.model('drivers');


// Authentication
router.get('/auth',function(request,response){
  var message = request.flash('message');
  response.render('auth/login',{
      msg:message
  });
});

router.post('/auth',urlEncodedMid,function(request,response){
  if (request.body.username == "hossam" && request.body.password == "123456") {
    request.session.loggedIn = true;
    response.redirect('/admin/dashboard');
  } else {
    request.flash("message"," not authorized !  invalid username or password");
    response.redirect('/admin/auth');
  }

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
      dLocation:request.body.dLocation,
      distance:request.body.distance,
      numberOfPersons:request.body.numberOfPersons,
      numberOfLuggage:request.body.numberOfLuggage,
      handicap:true,
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
      perMile:request.body.costPerMile,
      vehicleFee:request.body.costVehicleFee,
      discount:request.body.discount,
      others:request.body.others
    };
    doc['driver'] = request.body.driver;
    doc['totalCost'] = request.body.totalCost;
    doc['confirmation'] = request.body.confirmation;
    doc.save();
    response.redirect('/admin/dashboard');
  });

});

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




module.exports = router;
