var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var addons = new Schema({
    stop:Number,
    child:Number,
    earlyMorning:Number
});

mongoose.model('addons',addons)
