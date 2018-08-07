var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var promos = new Schema({
    createdAt:{
        type:Date,
        default:Date.now
    },
    code:String,
    value:String,
    numberUsed:{
        type:Number,
        default:0
    },
});

mongoose.model('promos',promos)
