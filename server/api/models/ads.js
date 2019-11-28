const mongoose = require('mongoose'), Schema = mongoose.Schema;
var adsUpload  = new mongoose.Schema({
    user_id:{
        type:String
    },
    adsid:{
        type:String
    },
    url:{
        type:String
    },
    path:{
        type:String
    },
    id:{
        type:String
    },
    createdAt:{
        type:Date,
        default: Date.now
    }

})
module.exports = mongoose.model('Ads', adsUpload);