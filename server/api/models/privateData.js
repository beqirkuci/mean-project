const mongoose = require('mongoose'), Schema = mongoose.Schema;
var privateDataSchema = new mongoose.Schema({
  user_id: {
    type: String, 
  },
  height: {

    type: Number
  },
    weight: {
      type: Number
  },
    bmi: {
    type: Number
  },
  description:{
    type:String
  },
    user : { type: Schema.Types.ObjectId, ref: 'User' },

});


module.exports = mongoose.model('PrivateData', privateDataSchema);
