const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const urlEncodedMid = bodyParser.urlencoded();

const mongoose = require('mongoose');
const promoModel = mongoose.model('promos');
let ObjectId = require('mongoose').Types.ObjectId;


router.get('/add/:code/:value',(request,response)=>{
  let promoDB = promoModel.find({value:request.params.code},function(err,doc){

      if (doc.length != 0) {
        response.send({
          isDublicate: true
        });
      }

      else {
        let promo = new promoModel({
          code: request.params.code.toUpperCase(),
          value: request.params.value,
          status: 'Available',
        });

        promo.save(function(err,doc){
            if(!err){
                response.send({
                  code: request.params.code.toUpperCase(),
                  value: request.params.value,
                  status: 'Available',
                  isDublicate: false
                });
            }else{
                response.json(err);
            }
        });
      }
  });
});

router.get('/check/:code',(request,response)=>{

  let promoDB = promoModel.findOne({code:request.params.code,status:'Available'},function(err,doc){

      if (doc) {
        doc['status'] = 'used';
        doc.save();
        response.send({
          isFound: true,
          value:doc.value
        });
      }

      else {
        response.send({
          isFound: false,
          isUsed:true
        });
      }
  });

});

router.get('/list',(request,response)=>{
  let promoDB = promoModel.find({},(err,docs)=>{
    response.render('promos/promoList',{
      promos : docs
    });
  });
});

// router.get('/edit/:id',(request,response)=>{
//   let id = request.params.id;
//   let carDB = carModel.findOne({'_id':new ObjectId(id)},(err,doc)=>{
//     response.render('cars/editCar',{
//       car : doc
//     });
//   });
// });
//
// router.post('/edit/:id',multerMid.single("image"),(request,response)=>{
//   carModel.findOne({'_id':new ObjectId(request.params.id)},(err,doc)=>{
//     doc['model'] = request.body.model;
//     doc['numberOfPersons'] = request.body.numberOfPersons;
//     doc['numberOfLuggage'] = request.body.numberOfLuggage;
//     doc['charge'] = {
//       perMile : {
//         main : request.body.perMile
//       },
//       vehicleFee : request.body.vehicleFee
//     };
//     if (request.file) {
//       doc['image'] = request.file.filename;
//     }
//     doc.save();
//     response.redirect('/cars/list');
//   });
// });

module.exports = router;
