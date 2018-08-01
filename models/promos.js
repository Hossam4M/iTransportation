var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var promos = new Schema({
    createdAt:{
        type:Date,
        default:Date.now
    },
    code:String,
    value:String,
    status:String,
});

mongoose.model('promos',promos)
