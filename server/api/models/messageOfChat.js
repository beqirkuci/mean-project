const mongoose = require('mongoose'),
  Schema = mongoose.Schema;
  var mongoosePaginate = require('mongoose-paginate');

const chatSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

},
  {
    timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
  });
  chatSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Chat', chatSchema);
