const User = require('../models/users.js');
var mongoosePaginate = require('mongoose-paginate');
const mongoose = require('mongoose'), Schema = mongoose.Schema;
var postsSchema = new mongoose.Schema({
  user_id: {
    type: String,
  },
  caption: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  surname: {
    type: String
  },

  liked:{
    type:Boolean,
    default:false
  },
  disliked :{
    type:Boolean,
    default:false
  },
  text: {
    type: String,
    required: true
  },
  createdAt:
  {
    type: Date,
    default: Date.now
  },
  numbersOfLikes: {
    type: String
  },
  numbersOfDisLikes:{
    type:String
  },

  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  disLikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  comment: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  images: { type: Schema.Types.ObjectId, ref: 'Medias' },
  notification:[{ type: Schema.Types.ObjectId, ref: 'Notification' }],

});

postsSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Posts', postsSchema);
