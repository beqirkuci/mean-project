const mongoose = require('mongoose'), Schema = mongoose.Schema;
var experienceSchema = new mongoose.Schema({
  user_id: {
    type: String,
  },
  title: {
    type: String
  },
  registrationNumber:{
    type:String
  },
  experience: {
    type: String,
    required: true
  },
  path: {
    type: String,
  },
  from: {
    type: Date,
    required: true
  },
  to: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now

  },
  workHere: {
    type: Boolean,
    default: false
  },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  messages: { type: Schema.Types.ObjectId, ref: 'Messages' }

});


module.exports = mongoose.model('Experiences', experienceSchema);
