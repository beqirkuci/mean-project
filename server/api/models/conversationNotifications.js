const mongoose = require('mongoose'), Schema = mongoose.Schema;
var conversationNotifications = new mongoose.Schema({
    conversation_id: {
    type: String,
  },
  user_id: {
    type: String
  },
  newMsg: {
    type: Boolean,
    default: false
    }
});


module.exports = mongoose.model('ConversationNotifications', conversationNotifications);
