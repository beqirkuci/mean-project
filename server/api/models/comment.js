const mongoose = require('mongoose'), Schema = mongoose.Schema;
const User = require('../models/users.js');

var commment = new mongoose.Schema({
    user_id: {
        type: String
    },
    comment:
    {
        type: String
    },
    post_id: {
        type: String
    },
    created:
    {
        type: Date,
        default: Date.now
    },
    liked: {
        type: Boolean,
        default: false
    },
    disliked: {
        type: Boolean,
        default: false
    },
    numbersOfLikes: {
        type: String
    },
    numbersOfDisLikes: {
        type: String
    },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    disLikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    posts: { type: Schema.Types.ObjectId, ref: 'Posts' },
    notification: [{ type: Schema.Types.ObjectId, ref: 'Notification' }],


})
module.exports = mongoose.model('Comment', commment);