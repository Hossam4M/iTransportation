var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var admins = new Schema({
    username:String,
    password:String,
});

mongoose.model('admins',admins)
