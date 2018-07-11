var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var drivers = new Schema({
    username:String,
    firstname:String,
    lastname:String,
    email:String,
    mobileNumber:String,
    car:String,

});

mongoose.model('drivers',drivers);
