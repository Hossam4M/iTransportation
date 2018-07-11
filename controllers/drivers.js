const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const urlEncodedMid = bodyParser.urlencoded();

const mongoose = require('mongoose');
const driverModel = mongoose.model('drivers');
// const carModel = mongoose.model('cars');
let ObjectId = require('mongoose').Types.ObjectId;

router.get('/add',(request,response)=>{
    let message = request.flash("message");
    let carDB = carModel.find({},(err,docs)=>{
      response.render('drivers/addDriver',{
          msg:message,
          cars:docs
      })
    });

});

router.post('/add',urlEncodedMid,(request,response)=>{

  let driverDB = driverModel.find({username:request.body.username},function(err,doc){
      if (doc.length != 0) {
          request.flash("message","Username is already used");
          response.redirect('/drivers/add');
      } else {
        var driver = new driverModel({
            username: request.body.username,
            firstname: request.body.firstname,
            lastname: request.body.lastname,
            email: request.body.email,
            mobileNumber: request.body.mobileNumber,
            car: request.body.car
        });

        driver.save(function(err,doc){
            if(!err){
                request.flash("message","Done");
                response.redirect('/drivers/add');
            }else{
                response.json(err);
            }
        });
      }
  });


});

router.get('/list',(request,response)=>{
  let driverDB = driverModel.find({},(err,docs)=>{
    response.render('drivers/driverList',{
      drivers : docs
    });
  });
});

router.get('/edit/:id',(request,response)=>{
  let id = request.params.id;
  let driverDB = driverModel.findOne({'_id':new ObjectId(id)},(err,doc)=>{
    response.render('drivers/editDriver',{
      driver : doc
    });
  });
});

router.post('/edit/:id',urlEncodedMid,(request,response)=>{
  driverModel.findOne({'_id':new ObjectId(request.params.id)},(err,doc)=>{
    doc['firstname'] = request.body.firstname;
    doc['lastname'] = request.body.lastname;
    doc['username'] = request.body.username;
    doc['email'] = request.body.email;
    doc['mobileNumber'] = request.body.mobileNumber;
    doc['car'] = request.body.mobileNumber;
    doc.save();
    response.redirect('/drivers/list');
  });
});


module.exports = router;
