const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const urlEncodedMid = bodyParser.urlencoded();

const mongoose = require('mongoose');
const carModel = mongoose.model('cars');
let ObjectId = require('mongoose').Types.ObjectId;

const multer = require('multer');
const multerMid = multer({
    dest:'./public/images'
});

router.get('/add',(request,response)=>{
  let message = request.flash("message");
  response.render('cars/addCar',{
      msg:message,
  })
});

router.post('/add',multerMid.single("image"),(request,response)=>{

  let carDB = carModel.find({model:request.body.model},function(err,doc){

      if (doc.length != 0) {
          request.flash("message","this car already exists !!!");
          response.redirect('/cars/add');
      }

      else {
        let car = new carModel({
            model: request.body.model,
            numberOfPersons: request.body.numberOfPersons,
            numberOfLuggage: request.body.numberOfLuggage,
            charge: {
              perMile : {
                main : request.body.perMile
              },
              vehicleFee : request.body.vehicleFee
            },
            order : parseInt(request.body.order),
            startingMiles : parseInt(request.body.startingMiles),
            startingMiles_charge : parseInt(request.body.startingMiles_charge),

            image: request.file.filename
        });

        car.save(function(err,doc){
            if(!err){
                console.log("done");
                request.flash("message","Done");
                response.redirect('/cars/add');
            }else{
                response.json(err);
            }
        });
      }
  });
});

router.get('/list',(request,response)=>{
  let carDB = carModel.find({}).sort('order').exec(function(err,docs){
    response.render('cars/carList',{
      cars : docs
    });
  });
});

router.get('/edit/:id',(request,response)=>{
  let id = request.params.id;
  let carDB = carModel.findOne({'_id':new ObjectId(id)},(err,doc)=>{
    response.render('cars/editCar',{
      car : doc
    });
  });
});

router.post('/edit/:id',multerMid.single("image"),(request,response)=>{
  carModel.findOne({'_id':new ObjectId(request.params.id)},(err,doc)=>{
    doc['model'] = request.body.model;
    doc['numberOfPersons'] = request.body.numberOfPersons;
    doc['numberOfLuggage'] = request.body.numberOfLuggage;
    doc['charge'] = {
      perMile : {
        main : request.body.perMile
      },
      vehicleFee : request.body.vehicleFee
    };
    doc['order'] = parseInt(request.body.order);
    doc['startingMiles'] = parseInt(request.body.startingMiles);
    doc['startingMiles_charge'] = parseInt(request.body.startingMiles_charge);
    if (request.file) {
      doc['image'] = request.file.filename;
    }
    doc.save();
    response.redirect('/cars/list');
  });
});

module.exports = router;
