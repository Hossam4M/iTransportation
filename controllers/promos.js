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
          numberUsed: 0
        });

        promo.save(function(err,doc){
            if(!err){
                response.send({
                  code: request.params.code.toUpperCase(),
                  value: request.params.value,
                  numberUsed: 0,
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

  let promoDB = promoModel.findOne({code:request.params.code},function(err,doc){

      if (doc) {
        doc['numberUsed'] += 1;
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


module.exports = router;
