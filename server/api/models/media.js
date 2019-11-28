const mongoose = require('mongoose'), Schema = mongoose.Schema;
var mediaImage = new mongoose.Schema({
  user_id: {
    type: String, 
  },
 image:{
     type:String
 },
 time:{
    type: Date,
    default: Date.now
},
 post_id:{
     type:String
 },
 timeline_id:{
     type:String
 }

});


module.exports = mongoose.model('Medias', mediaImage);
