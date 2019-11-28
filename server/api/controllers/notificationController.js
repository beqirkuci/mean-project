var mongoose = require('mongoose');
var User = mongoose.model('User');
var Notification = mongoose.model('Notification');
var Posts = mongoose.model('Posts');
var async = require("async");
var Comment = mongoose.model('Comment');

module.exports.getNotificationForPosts = function (req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    }
    else {
        User.findById(req.payload._id).exec(function (err, user) {
            
            var date = new Date();
            date.setDate(date.getDate() - 30);
            var dateString = date.toISOString().split('T')[0];


     
            Notification.find({ "targetUser": user ,"time": {"$gte": new Date(dateString), "$lt": new Date()}}).sort({ time: 'desc' })
                .populate('User')
                .populate('user_disLikes')
                .populate('user_comment_likes')
                .populate('user_comment_disLikes')
                .populate('user_likes')
                .populate('targetUser')
                .populate('user_comments')
                .exec(function (err, notificationn) {

                    if (err) res.send(err);
                    else {
                        async.forEachOf(notificationn, (eachNotification) => {
                            //getting in milliseconds the date of notification
                            eachNotification.notificationStatus = false;
                            eachNotification.save(function (err) {
                                if (err) console.log(err)
                            })

                        

                        })


                        user.numberOfNotification = 0;
                        user.resetNotification = true;
                        user.save(function (err) {
                            if (err) console.log(err)
                        })

                    }


                    res.status(200).json({ success: true, "Your Notification": notificationn, "numberOfNotification": user.numberOfNotification })

                })
        })
    }
}
module.exports.deleteNotification = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    }
    else {
        User.findById(req.payload._id).exec(function (err, user) {
            if (err) console.log(err)
            else {
                var deletedNotification = req.params.id;

                Notification.findById(deletedNotification).exec(function (err, notificationToBeDeleted) {
                    if (err)
                        console.log(err)
                    else if (!notificationToBeDeleted) {
                        res.status(200).json({ success: false, message: "Notification could not be found with id provided" })
                    }
                    else {

                        if (notificationToBeDeleted.typeOf === 'commentDisLike' || notificationToBeDeleted.typeOf === 'commentLike') {
                            console.log('only Comment checked')
                            Comment.findById(notificationToBeDeleted.comment_id).exec(function (err, comment) {
                                if (err) console.log(err)
                                else {
                                    for (var i = comment.notification.length - 1; i >= 0; i--) {
                                        if ((comment.notification[i].toString()) == (notificationToBeDeleted._id.toString())) {
                                            comment.notification.splice(i, 1);
                                            comment.save(function (err) {
                                                if (err) console.log(err)

                                            })
                                        }
                                    }
                                }
                            })
                            if ((user._id.toString()) == (notificationToBeDeleted.targetUser.toString())) {
                                Notification.findByIdAndRemove(deletedNotification).exec(function (err, notification) {
                                    if (err) console.log(err)
                                    else {
                                        res.status(200).json({ success: true, message: "You successfully deleted notification", "notification": notificationToBeDeleted })
                                    }
                                })
                            }
                        }
                        else if (notificationToBeDeleted.typeOf === 'disLike' || notificationToBeDeleted.typeOf === 'Like' || notificationToBeDeleted.typeOf === 'Comment') {
                            console.log('only Post checked')

                            Posts.findById(notificationToBeDeleted.post_id).exec(function (err, post) {
                                if (err) console.log(err)
                                else {
                                    for (var i = post.notification.length - 1; i >= 0; i--) {
                                        if ((post.notification[i].toString()) == (notificationToBeDeleted._id.toString())) {
                                            post.notification.splice(i, 1);
                                            post.save(function (err) {
                                                if (err) console.log(err)

                                            })
                                        }
                                    }
                                }
                            })
                            if ((user._id.toString()) == (notificationToBeDeleted.targetUser.toString())) {
                                Notification.findByIdAndRemove(deletedNotification).exec(function (err, notification) {
                                    if (err) console.log(err)
                                    else {
                                        res.status(200).json({ success: true, message: "You successfully deleted notification", "notification": notificationToBeDeleted })
                                    }
                                })
                            }
                        }
                        else {
                            res.status(200).json({ success: false, message: "cannot deleted others notification" })
                        }
                    }
                })
            }
        })
    }
}
module.exports.userNotifictionNumber = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    }
    else {
        User.findById(req.payload._id).exec(function (err, user) {
            if (user.resetNotification) {
                user.numberOfNotification = 0;
                res.status(200).json({ "numberOfNotification": user.numberOfNotification });
            }
            else {
                Notification.count({ "targetUser": user._id, "notificationStatus": true }, function (err, c) {
                    if (err) console.log(err)
                    else {
                        user.numberOfNotification = c;
                        res.status(200).json({ "numberOfNotification": user.numberOfNotification });
                    }
                })

            }
        })

    }
}
module.exports.changeNotificationStatus = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    }
    else {
        var idOfNotification = req.params.id;
        Notification.findById(idOfNotification).populate('User').populate('user_likes').populate('targetUser').populate('user_comments').exec(function (err, notification) {
            if (err) res.send(err);
            else {
                if (notification) {

                    notification.active = false;
                    notification.save(function (err) {
                        if (err) res.send(err)
                    })
                    res.status(200).json({ success: true, message: "notification status changed", "notification": notification })

                }
                else {
                    res.status(200).json({ success: false, message: "could not find notification in DB with id provided" })
                }
            }
        })
    }
}