const mongoose = require('mongoose'), Schema = mongoose.Schema;

var notifications = new mongoose.Schema({
    user_id: {
        type: String
    },
    post_id: {
        type: String
    },
    comment_id: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    },
    notificationStatus: {
        type: Boolean,
        default: true
    },
    typeOf:{
        type:String
    },
    time:
    {
        type: Date,
        default: Date.now
    },
    like_Date:{
        type:Date
    },
    disLike_Date:{
        type:Date
    },
    like_comment_Date:{
        type:Date
    },
    disLike_comment_Date:{
        type:Date
    },
    comment_Date:{
        type:Date
    }
    ,
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    targetUser: { type: Schema.Types.ObjectId, ref: 'User' },
    user_likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    user_disLikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    user_comment_likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    user_comment_disLikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    user_comments: [{ type: Schema.Types.ObjectId, ref: 'User' }]

})
module.exports = mongoose.model('Notification', notifications);