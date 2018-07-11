var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var cars = new Schema({
    createdAt:{
        type:Date,
        default:Date.now
    },
    model:{
      type: String,
      required: true
    },
    image:String,
    numberOfPersons:Number,
    numberOfLuggage:Number,
    charge:{
      perMile : {
        main:Number,
      },
      vehicleFee:Number
    }
});

mongoose.model('cars',cars)
