const mongoose = require('mongoose'), Schema = mongoose.Schema;
const User = require('../models/users.js');

var timeline = new mongoose.Schema({
    user_id: {
        type: String
    },
    name: {
        type: String
    },
    surname: {
        type: String
    },
    time: {
        type: Date
    },
    title:
    {
        type: String
    },
    createdAt:
    {
        type: Date,
        default: Date.now
    },
    content: {
        type: String
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    images: { type: Schema.Types.ObjectId, ref: 'Medias' }

})
module.exports = mongoose.model('Timeline', timeline);