const User = require('../models/users.js');
const mongoose = require('mongoose'), Schema = mongoose.Schema;
var messages = new mongoose.Schema({
  user_id: {
    type: String,
  },
  post_id: {
    type: String
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
  },
  time:
  {
    type: Date,
    default: Date.now
  },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  experiences: [{ type: Schema.Types.ObjectId, ref: 'Experiences' }],
  post: { type: Schema.Types.ObjectId, ref: 'Posts' }
});


module.exports = mongoose.model('Messages', messages);
