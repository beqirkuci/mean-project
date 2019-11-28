var mongoose = require('mongoose');
var Posts = mongoose.model('Posts');
var User = mongoose.model('User');
var Comment = mongoose.model('Comment');
var Notification = mongoose.model('Notification');
var async = require("async");

module.exports.addComment = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    }
    else {
        var payload = req.payload._id;
        var comment = req.body.comment;
        Posts.findByIdAndUpdate(req.params.postId).populate('comment').exec(function (err, post) {
            User.findById(req.payload._id).exec(function (req, user) {

                if (!post) {
                    res.status(200).json({ success: false, message: "post with id provided could not be found" })
                }

                else {

                    var commentt = new Comment();

                    commentt.user_id = payload;
                    commentt.comment = comment;
                    commentt.user = user;
                    commentt.post_id = post._id;
                    post.comment.push(commentt);
                    commentt.save(function (err) {
                        if (err) {
                            res.json({
                                success: false,
                                message: "Comment can not be created",
                                "Caused by ": err
                            });
                        }
                    })

                    if (post.notification.length == 0) {


                        if (post.user.toString() != user._id) {
                            var notification = new Notification();
                            notification.targetUser = post.user;
                            notification.comment_Date = Date.now();
                            notification.typeOf = 'Comment';
                            notification.post_id = post._id;
                            notification.user_id = user._id;
                            notification.user = user;
                            notification.user_comments.push(user);
                            notification.save(function (err) {
                                if (err) {
                                    res.json({
                                        success: false,
                                        message: "Comment can not be created",
                                        "Caused by ": err
                                    });
                                }
                            })

                            post.notification.push(notification);


                            post.save(function (err) {
                                if (err) {
                                    res.json({
                                        success: false,
                                        message: "Comment can not be created",
                                        "Caused by ": err
                                    });
                                }
                                else {

                                    User.findById(post.user).exec(function (err, utente) {
                                        utente.resetNotification = false;
                                        utente.save(function (err) {
                                            if (err) {
                                                res.json({
                                                    success: false,
                                                    message: "Comment can not be created",
                                                    "Caused by ": err
                                                });
                                            }
                                        })




                                        res.status(200).json({
                                            success: true,
                                            messsage: "Comment added created!",
                                            "comment ": commentt

                                        });
                                    })


                                }
                            })
                        }

                        else {
                            post.save(function (err) {
                                if (err) {
                                    res.json({
                                        success: false,
                                        message: "Comment can not be created",
                                        "Caused by ": err
                                    });
                                }
                                else {
                                    res.status(200).json({
                                        success: true,
                                        messsage: "Comment added created!",
                                        "comment ": commentt
                                    });
                                }
                            })
                        }


                    }

                    else {
                        var counter = 0;
                        Notification.find().exec(function (err, notification) {
                            if (err) res.send(err)
                            async.forEachOf(notification, (elements, key, callback) => {
                                async.forEachOf(post.notification, (notificationId, key, callback) => {

                                    if ((notificationId.toString()) == (elements._id.toString())) {
                                        if (elements.typeOf === 'Comment') {
                                            counter++;
                                            var countt = 0;
                                            async.forEachOf(elements.user_comments, (usersInArray, key, callback) => {
                                                if ((usersInArray.toString()) == (user._id.toString())) {
                                                    countt++;
                                                    elements.comment_Date = Date.now();
                                                    elements.time = Date.now();
                                                    elements.notificationStatus = true;
                                                    elements.active = true;
                                                    elements.save(function (err) {
                                                        if (err) {
                                                            res.json({
                                                                success: false,
                                                                message: "Comment can not be created",
                                                                "Caused by ": err
                                                            });
                                                        }
                                                    })

                                                    User.findById(post.user).exec(function (err, utente) {
                                                        utente.resetNotification = false;

                                                        utente.save(function (err) {
                                                            if (err) {
                                                                res.json({
                                                                    success: false,
                                                                    message: "Comment can not be created",
                                                                    "Caused by ": err
                                                                });
                                                            }
                                                        })
                                                    })
                                                    post.save(function (err) {
                                                        if (err) {
                                                            console.log(err)
                                                        }
                                                        else {
                                                            res.status(200).json({
                                                                success: true,
                                                                messsage: "Comment added created!",
                                                                "comment ": commentt
                                                            });
                                                        }
                                                    })

                                                }

                                            }, err => {
                                                if (err) console.log(err);
                                            });
                                            if (countt === 0) {
                                                if (post.user.toString() != user._id) {

                                                    elements.comment_Date = Date.now();
                                                    elements.time = Date.now();
                                                    elements.notificationStatus = true;
                                                    elements.active = true;
                                                    elements.user_comments.push(user);
                                                    elements.save(function (err) {
                                                        if (err) {
                                                            res.json({
                                                                success: false,
                                                                message: "Comment can not be created",
                                                                "Caused by ": err
                                                            });
                                                        }
                                                    })
                                                    User.findById(post.user).exec(function (err, utente) {
                                                        utente.resetNotification = false;
                                                        utente.save(function (err) {
                                                            if (err) {
                                                                res.json({
                                                                    success: false,
                                                                    message: "Comment can not be created",
                                                                    "Caused by ": err
                                                                });
                                                            }
                                                        })
                                                    })
                                                    post.save(function (err) {
                                                        if (err) {
                                                            console.log(err)
                                                        }
                                                        else {
                                                            res.status(200).json({
                                                                success: true,
                                                                messsage: "Comment added created!",
                                                                "comment ": commentt
                                                            });
                                                        }
                                                    })


                                                }
                                                else {

                                                    post.save(function (err) {
                                                        if (err) {
                                                            console.log(err)
                                                        }
                                                        else {
                                                            res.status(200).json({
                                                                success: true,
                                                                messsage: "Comment added created!",
                                                                "comment ": commentt
                                                            });
                                                        }
                                                    })
                                                }
                                            }


                                        }
                                        else return;
                                    }
                                    else return;
                                }
                                    , err => {
                                        if (err) console.log(err);
                                    });
                            }
                                , err => {
                                    if (err) console.log(err);
                                });

                            if (counter === 0) {

                                if (post.user.toString() != user._id) {
                                    console.log('new notification Object created for Comment 2222')
                                    var notification = new Notification();
                                    notification.targetUser = post.user;
                                    notification.comment_Date = Date.now();
                                    notification.typeOf = 'Comment';
                                    notification.post_id = post._id;
                                    notification.user_id = user._id;
                                    notification.user = user;
                                    notification.user_comments.push(user);
                                    notification.save(function (err) {
                                        if (err) {
                                            res.json({
                                                success: false,
                                                message: "Comment can not be created",
                                                "Caused by ": err
                                            });
                                        }
                                    })
                                    post.notification.push(notification);




                                    post.save(function (err) {
                                        if (err) {
                                            res.json({
                                                success: false,
                                                message: "Comment can not be created",
                                                "Caused by ": err
                                            });
                                        }
                                        else {

                                            User.findById(post.user).exec(function (err, utente) {
                                                utente.resetNotification = false;
                                                utente.save(function (err) {
                                                    if (err) {
                                                        res.json({
                                                            success: false,
                                                            message: "Comment can not be created",
                                                            "Caused by ": err
                                                        });
                                                    }
                                                })

                                                res.status(200).json({
                                                    success: true,
                                                    messsage: "Comment added created!",
                                                    "comment ": commentt

                                                });
                                            })
                                        }
                                    })
                                }
                                else {
                                    post.save(function (err) {
                                        if (err) {
                                            res.json({
                                                success: false,
                                                message: "Comment can not be created",
                                                "Caused by ": err
                                            });
                                        }
                                        else {
                                            res.status(200).json({
                                                success: true,
                                                messsage: "Comment added created!",
                                                "comment ": commentt

                                            });
                                        }
                                    })
                                }
                            }

                        })
                    }






                }
            })
        })
    }
}
module.exports.editComment = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    }
    else {
        Comment.findById(req.body._id).exec(function (err, comment) {
            comment.comment = req.body.comment;
            comment.save(function (err) {
                if (err) {
                    res.json({
                        success: false,
                        message: "Comment can not be updated",
                        "Caused by ": err
                    });
                } else {
                    res.status(200).json({
                        success: true,
                        messsage: "Comment updated!"
                    });
                }
            })
        })
    }
}
module.exports.deleteComment = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "Private profile"
        });
    }
    else {
        var deleteComment = req.params.commentId;
        var postid = req.params.postId;

        Posts.findById(postid).populate('comment').exec(function (err, post) {

            for (var i = post.comment.length - 1; i >= 0; i--) {



                if (post.comment[i].id == deleteComment) {
                    post.comment.splice(i, 1);
                    post.save(function (err, res) {
                        if (err) {
                            // Check if any validation errors exists (from user model)
                            res.json({
                                success: false,
                                message: "likes canot be created",
                                "Caused by ": err
                            }); // Display any other errors with validation
                        }
                    });
                }
            }
        });


        Comment.findById(deleteComment, function (err, comments) {
            if (err) {
                res.json({
                    success: false,
                    message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!'
                });
            }

            else {
                if (!comments) {
                    res.json({
                        success: false,
                        message: 'No Coments found with id provided '
                    }); // Return error
                }
                else {
                    if (comments.notification.length > 0) {

                        comments.notification.forEach(function (element) {

                            Notification.findByIdAndRemove(element, function (err) {
                                if (err) console.log(err)
                            })
                        })
                    }



                    if (comments.user_id == req.payload._id) {


                        Comment.findByIdAndRemove(deleteComment, function (err, user) {
                            res.json({
                                success: true,
                                message: "Comment  was successfully deleted"
                            }); // Return success status

                        });

                    }
                    else {
                        res.status(200).json({ message: "you dont have permission to delete others comment" })
                    }

                }
            }
        });
    }
}











module.exports.addLikeToComment = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: invalid token"
        });
    } else {

        var logged_user = req.payload._id;
        Comment.findByIdAndUpdate(req.params.commentId).populate('likes').populate('disLikes').exec(function (err, comment) {
            User.findById(logged_user).exec(function (req, user) {
                var count = 0;
                if (comment.likes === undefined || comment.likes.length == 0) {
                    count++;
                    comment.likes.push(user);
                    for (var i = comment.disLikes.length - 1; i >= 0; i--) {


                        if (comment.disLikes[i].id == user._id) {
                            comment.disLikes.splice(i, 1);
                        }
                    }


                    if (comment.notification.length === 0) {
                        if (comment.user.toString() != user._id) {

                            var notification = new Notification();
                            notification.targetUser = comment.user;
                            notification.like_comment_Date = Date.now();
                            notification.typeOf = 'commentLike';
                            notification.comment_id = comment._id;
                            notification.user_id = user._id;
                            notification.user = user;
                            notification.post_id = comment.post_id;
                            notification.user_comment_likes.push(user);
                            notification.save(function (err) {
                                if (err) {
                                    res.json({
                                        success: false,
                                        message: "Comment can not be created",
                                        "Caused by ": err
                                    });
                                }
                            })
                            comment.notification.push(notification);
                            comment.save(function (err) {
                                if (err) {
                                    // Check if any validation errors exists (from user model)
                                    res.json({
                                        success: false,
                                        message: "disLikes canot be created",
                                        "Caused by ": err
                                    }); // Display any other errors with validation
                                }
                                User.findById(comment.user).exec(function (err, utente) {
                                    utente.resetNotification = false;
                                    utente.save(function (err) {
                                        if (err) {
                                            res.json({
                                                success: false,
                                                message: "Comment can not be created",
                                                "Caused by ": err
                                            });
                                        }
                                    })
                                })
                                res.status(200).json({ success: true, message: "like added to Comment", "likes": comment.likes.length, "disLikes": comment.disLikes.length });
                            });
                        } else {
                            comment.save(function (err) {
                                if (err) {
                                    // Check if any validation errors exists (from user model)
                                    res.json({
                                        success: false,
                                        message: "disLikes canot be created",
                                        "Caused by ": err
                                    }); // Display any other errors with validation
                                }

                                res.status(200).json({ success: true, message: "like added to Comment", "likes": comment.likes.length, "disLikes": comment.disLikes.length });
                            });
                        }
                    }
                    else {
                        var counter = 0;
                        Notification.find().exec(function (err, notification) {
                            if (err) res.send(err)
                            async.forEachOf(notification, (elements, key, callback) => {
                                async.forEachOf(comment.notification, (notificationId, key, callback) => {

                                    if ((notificationId.toString()) == (elements._id.toString())) {
                                        if (elements.typeOf === 'commentLike') {
                                            counter++;
                                            var countt = 0;
                                            async.forEachOf(elements.user_comment_likes, (usersInArray, key, callback) => {
                                                if ((usersInArray.toString()) == (user._id.toString())) {
                                                    countt++;
                                                    

                                                    User.findById(comment.user).exec(function (err, utente) {
                                                        utente.resetNotification = false;
                                                        utente.save(function (err) {
                                                            if (err) {
                                                                res.json({
                                                                    success: false,
                                                                    message: "Comment can not be created",
                                                                    "Caused by ": err
                                                                });
                                                            }
                                                        })
                                                    })
                                                    elements.active = true;
                                                    elements.like_comment_Date = Date.now();
                                                    elements.time = Date.now();
                                                    elements.notificationStatus = true;

                                                    elements.save(function (err) {

                                                        if (err) {
                                                            res.json({
                                                                success: false,
                                                                message: "Comment can not be created",
                                                                "Caused by ": err
                                                            });
                                                        }
                                                    })
                                                    comment.save(function (err) {
                                                        if (err) {
                                                            // Check if any validation errors exists (from user model)
                                                            res.json({
                                                                success: false,
                                                                message: "disLikes canot be created",
                                                                "Caused by ": err
                                                            }); // Display any other errors with validation
                                                        }

                                                        res.status(200).json({ success: true, message: "like added to Comment", "likes": comment.likes.length, "disLikes": comment.disLikes.length });
                                                    });


                                                }

                                            }, err => {
                                                if (err) console.log(err);
                                            });
                                            if (countt === 0) {
                                                if (comment.user.toString() != user._id) {
                                                    User.findById(comment.user).exec(function (err, utente) {
                                                        utente.resetNotification = false;
                                                        utente.save(function (err) {
                                                            if (err) {
                                                                res.json({
                                                                    success: false,
                                                                    message: "Comment can not be created",
                                                                    "Caused by ": err
                                                                });
                                                            }
                                                        })
                                                    })
                                                    elements.notificationStatus = true;
                                                    elements.active = true;
                                                    elements.like_comment_Date = Date.now();
                                                    elements.time = Date.now();
                                                    elements.user_comment_likes.push(user);
                                                    elements.save(function (err) {

                                                        if (err) {
                                                            res.json({
                                                                success: false,
                                                                message: "Comment can not be created",
                                                                "Caused by ": err
                                                            });
                                                        }
                                                    })
                                                    comment.save(function (err) {
                                                        if (err) {
                                                            // Check if any validation errors exists (from user model)
                                                            res.json({
                                                                success: false,
                                                                message: "disLikes canot be created",
                                                                "Caused by ": err
                                                            }); // Display any other errors with validation
                                                        }

                                                        res.status(200).json({ success: true, message: "like added to Comment", "likes": comment.likes.length, "disLikes": comment.disLikes.length });
                                                    });

                                                }
                                                else {
                                                    comment.save(function (err) {
                                                        if (err) {
                                                            // Check if any validation errors exists (from user model)
                                                            res.json({
                                                                success: false,
                                                                message: "disLikes canot be created",
                                                                "Caused by ": err
                                                            }); // Display any other errors with validation
                                                        }

                                                        res.status(200).json({ success: true, message: "like added to Comment", "likes": comment.likes.length, "disLikes": comment.disLikes.length });
                                                    });
                                                }
                                            }
                                        }
                                        else return;
                                    }
                                    else return;
                                }
                                    , err => {
                                        if (err) console.log(err);
                                    });
                            }
                                , err => {
                                    if (err) console.log(err);
                                });
                            if (counter === 0) {
                                if (comment.user.toString() != user._id) {
                                    var notification = new Notification();
                                    notification.targetUser = comment.user;
                                    notification.like_comment_Date = Date.now();
                                    notification.typeOf = 'commentLike';
                                    notification.comment_id = comment._id;
                                    notification.user_id = user._id;
                                    notification.post_id = comment.post_id;
                                    notification.user = user;
                                    notification.user_comment_likes.push(user);
                                    notification.save(function (err) {
                                        if (err) {
                                            res.json({
                                                success: false,
                                                message: "Comment can not be created",
                                                "Caused by ": err
                                            });
                                        }
                                    })
                                    comment.notification.push(notification);
                                    comment.save(function (err) {
                                        if (err) {
                                            // Check if any validation errors exists (from user model)
                                            res.json({
                                                success: false,
                                                message: "disLikes canot be created",
                                                "Caused by ": err
                                            }); // Display any other errors with validation
                                        }
                                        User.findById(comment.user).exec(function (err, utente) {
                                            utente.resetNotification = false;
                                            utente.save(function (err) {
                                                if (err) {
                                                    res.json({
                                                        success: false,
                                                        message: "Comment can not be created",
                                                        "Caused by ": err
                                                    });
                                                }
                                            })
                                        })
                                        res.status(200).json({ success: true, message: "like added to Comment", "likes": comment.likes.length, "disLikes": comment.disLikes.length });
                                    });
                                } else {
                                    comment.save(function (err) {
                                        if (err) {
                                            // Check if any validation errors exists (from user model)
                                            res.json({
                                                success: false,
                                                message: "disLikes canot be created",
                                                "Caused by ": err
                                            }); // Display any other errors with validation
                                        }

                                        res.status(200).json({ success: true, message: "like added to Comment", "likes": comment.likes.length, "disLikes": comment.disLikes.length });
                                    });
                                }
                            }

                        })
                    }



                }
                else {

                    for (var i = comment.likes.length - 1; i >= 0; i--) {


                        if (comment.likes[i].id == user._id) {
                            comment.likes.splice(i, 1);
                            comment.save(function (err, res) {
                                if (err) {
                                    // Check if any validation errors exists (from user model)
                                    res.json({
                                        success: false,
                                        message: "likes canot be created",
                                        "Caused by ": err
                                    }); // Display any other errors with validation
                                }
                            });
                            res.status(200).json({ success: true, message: "You have Unliked this Comment", "likes": comment.likes.length, "disLikes": comment.disLikes.length });
                            res.end();
                            count++;
                        }

                    }
                }
                if (count === 0) {
                    comment.likes.push(user);
                    for (var i = comment.disLikes.length - 1; i >= 0; i--) {


                        if (comment.disLikes[i].id == user._id) {
                            comment.disLikes.splice(i, 1);
                        }
                    }



                    var counter=0; 
                    Notification.find().exec(function (err, notification) {
                        if (err) res.send(err)
                        async.forEachOf(notification, (elements, key, callback) => {
                            async.forEachOf(comment.notification, (notificationId, key, callback) => {

                                if ((notificationId.toString()) == (elements._id.toString())) {
                                    if (elements.typeOf === 'commentLike') {
                                        counter++;
                                        var countt = 0;
                                        async.forEachOf(elements.user_comment_likes, (usersInArray, key, callback) => {
                                            if ((usersInArray.toString()) == (user._id.toString())) {
                                                countt++;
                                                elements.notificationStatus = true;

                                                elements.like_comment_Date = Date.now();
                                                elements.time = Date.now();
                                                elements.active = true;
                                                elements.save(function (err) {
                                                    User.findById(comment.user).exec(function (err, utente) {
                                                        utente.resetNotification = false;
                                                        utente.save(function (err) {
                                                            if (err) {
                                                                res.json({
                                                                    success: false,
                                                                    message: "Comment can not be created",
                                                                    "Caused by ": err
                                                                });
                                                            }
                                                        })
                                                    })
                                                    if (err) {
                                                        res.json({
                                                            success: false,
                                                            message: "Notification can not be updated",
                                                            "Caused by ": err
                                                        });
                                                    }
                                                })
                                                comment.save(function (err) {
                                                    if (err) {
                                                        // Check if any validation errors exists (from user model)
                                                        res.json({
                                                            success: false,
                                                            message: "disLikes canot be created",
                                                            "Caused by ": err
                                                        }); // Display any other errors with validation
                                                    }
            
                                                    res.status(200).json({ success: true, message: "like added to Comment", "likes": comment.likes.length, "disLikes": comment.disLikes.length });
                                                });
                                            }

                                        }, err => {
                                            if (err) console.log(err);
                                        });
                                        if (countt === 0) {
                                            if (comment.user.toString() != user._id){
                                            elements.like_comment_Date = Date.now();
                                            elements.time = Date.now();
                                            elements.notificationStatus = true;
                                            elements.active = true;
                                            elements.user_comment_likes.push(user);
                                            elements.save(function (err) {
                                                User.findById(comment.user).exec(function (err, utente) {
                                                    utente.resetNotification = false;
                                                    utente.save(function (err) {
                                                        if (err) {
                                                            res.json({
                                                                success: false,
                                                                message: "Comment can not be created",
                                                                "Caused by ": err
                                                            });
                                                        }
                                                    })
                                                })
                                                if (err) {
                                                    res.json({
                                                        success: false,
                                                        message: "Notification can not be updated",
                                                        "Caused by ": err
                                                    });
                                                }
                                            })
                                            comment.save(function (err) {
                                                if (err) {
                                                    // Check if any validation errors exists (from user model)
                                                    res.json({
                                                        success: false,
                                                        message: "disLikes canot be created",
                                                        "Caused by ": err
                                                    }); // Display any other errors with validation
                                                }
        
                                                res.status(200).json({ success: true, message: "like added to Comment", "likes": comment.likes.length, "disLikes": comment.disLikes.length });
                                            });
                                        }
                                            else{
                                                comment.save(function (err) {
                                                    if (err) {
                                                        // Check if any validation errors exists (from user model)
                                                        res.json({
                                                            success: false,
                                                            message: "disLikes canot be created",
                                                            "Caused by ": err
                                                        }); // Display any other errors with validation
                                                    }
            
                                                    res.status(200).json({ success: true, message: "like added to Comment", "likes": comment.likes.length, "disLikes": comment.disLikes.length });
                                                });
                                            }

                                        }
                                    }
                                    else return;
                                }
                                else return
                            }
                                , err => {
                                    if (err) console.log(err);
                                });
                        }
                            , err => {
                                if (err) console.log(err);
                            });


                            if (counter === 0) {
                                if (comment.user.toString() != user._id){
                                var notification = new Notification();
                                notification.targetUser = comment.user;
                                notification.like_comment_Date = Date.now();
                                notification.typeOf = 'commentLike';
                                notification.comment_id = comment._id;
                                notification.user_id = user._id;
                                notification.user = user;
                                notification.post_id = comment.post_id;
                                notification.user_comment_likes.push(user);
                                notification.save(function (err) {
                                    if (err) {
                                        res.json({
                                            success: false,
                                            message: "Comment can not be created",
                                            "Caused by ": err
                                        });
                                    }
                                })
                                comment.notification.push(notification);
                                comment.save(function (err) {
                                    if (err) {
                                        // Check if any validation errors exists (from user model)
                                        res.json({
                                            success: false,
                                            message: "disLikes canot be created",
                                            "Caused by ": err
                                        }); // Display any other errors with validation
                                    }
                                    User.findById(comment.user).exec(function (err, utente) {
                                        utente.resetNotification = false;
                                        utente.save(function (err) {
                                            if (err) {
                                                res.json({
                                                    success: false,
                                                    message: "Comment can not be created",
                                                    "Caused by ": err
                                                });
                                            }
                                        })
                                    })
                                    res.status(200).json({ success: true, message: "like added to Comment", "likes": comment.likes.length, "disLikes": comment.disLikes.length });
                                });
                            } else {
                                comment.save(function (err) {
                                    if (err) {
                                        // Check if any validation errors exists (from user model)
                                        res.json({
                                            success: false,
                                            message: "disLikes canot be created",
                                            "Caused by ": err
                                        }); // Display any other errors with validation
                                    }
    
                                    res.status(200).json({ success: true, message: "like added to Comment", "likes": comment.likes.length, "disLikes": comment.disLikes.length });
                                });
                            }
                            }
                    })
                  
                }
            });
        });
    }
};



module.exports.addDislikeToComment = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: invalid token"
        });
    } else {
        var logged_user = req.payload._id;
        Comment.findByIdAndUpdate(req.params.commentId).populate('disLikes').populate('likes').exec(function (err, comment) {
            User.findById(logged_user).exec(function (req, user) {

                var count = 0;
                if (comment.disLikes === undefined || comment.disLikes.length == 0) {
                    count++;
                    comment.disLikes.push(user);
                    for (var i = comment.likes.length - 1; i >= 0; i--) {


                        if (comment.likes[i].id == user._id) {
                            comment.likes.splice(i, 1);
                        }

                    }

                    if (comment.notification.length === 0) {
                       
                        if (comment.user.toString() != user._id){
                        var notification = new Notification();
                        notification.targetUser = comment.user;
                        notification.disLike_comment_Date = Date.now();
                        notification.typeOf = 'commentDisLike';
                        notification.comment_id = comment._id;
                        notification.post_id = comment.post_id;
                        notification.user_id = user._id;
                        notification.user = user;
                        notification.user_comment_disLikes.push(user);
                        notification.save(function (err) {
                            if (err) {
                                res.json({
                                    success: false,
                                    message: "Comment can not be created",
                                    "Caused by ": err
                                });
                            }
                        })
                        comment.notification.push(notification);
                        comment.save(function (err) {
                            if (err) {
                                // Check if any validation errors exists (from user model)
                                res.json({
                                    success: false,
                                    message: "disLikes canot be created",
                                    "Caused by ": err
                                }); // Display any other errors with validation
                            }
                            User.findById(comment.user).exec(function (err, utente) {
                                utente.resetNotification = false;
                                utente.save(function (err) {
                                    if (err) {
                                        res.json({
                                            success: false,
                                            message: "Comment can not be created",
                                            "Caused by ": err
                                        });
                                    }
                                })
                            })
                            res.status(200).json({ success: true, message: "disLike added to Comment", "disLikes": comment.disLikes.length, "likes": comment.likes.length });
                        });
                    }
                    else{
                        comment.save(function (err) {
                            if (err) {
                                // Check if any validation errors exists (from user model)
                                res.json({
                                    success: false,
                                    message: "disLikes canot be created",
                                    "Caused by ": err
                                }); // Display any other errors with validation
                            }
                            
                            res.status(200).json({ success: true, message: "disLike added to Comment", "disLikes": comment.disLikes.length, "likes": comment.likes.length });
                        });
                    }
                    }
                    else {
                        var counter = 0;
                        Notification.find().exec(function (err, notification) {
                            if (err) res.send(err)
                            async.forEachOf(notification, (elements, key, callback) => {
                                async.forEachOf(comment.notification, (notificationId, key, callback) => {

                                    if ((notificationId.toString()) == (elements._id.toString())) {
                                        if (elements.typeOf === 'commentDisLike') {
                                            counter++;
                                            var countt = 0;
                                            async.forEachOf(elements.user_comment_disLikes, (usersInArray, key, callback) => {
                                                if ((usersInArray.toString()) == (user._id.toString())) {
                                                    User.findById(comment.user).exec(function (err, utente) {
                                                        utente.resetNotification = false;
                                                        utente.save(function (err) {
                                                            if (err) {
                                                                res.json({
                                                                    success: false,
                                                                    message: "Comment can not be created",
                                                                    "Caused by ": err
                                                                });
                                                            }
                                                        })
                                                    })
                                                    countt++;
                                                    elements.active = true;
                                                    elements.disLike_comment_Date = Date.now();
                                                    elements.time = Date.now();
                                                    elements.notificationStatus = true;

                                                    elements.save(function (err) {

                                                        if (err) {
                                                            res.json({
                                                                success: false,
                                                                message: "Comment can not be created",
                                                                "Caused by ": err
                                                            });
                                                        }
                                                    })

                                                    comment.save(function (err) {
                                                        if (err) {
                                                            // Check if any validation errors exists (from user model)
                                                            res.json({
                                                                success: false,
                                                                message: "disLikes canot be created",
                                                                "Caused by ": err
                                                            }); // Display any other errors with validation
                                                        }
                                                       
                                                        res.status(200).json({ success: true, message: "disLike added to Comment", "disLikes": comment.disLikes.length, "likes": comment.likes.length });
                                                    });

                                                }

                                            }, err => {
                                                if (err) console.log(err);
                                            });
                                            if (countt === 0) {
                                                if (comment.user.toString() != user._id){
                                                User.findById(comment.user).exec(function (err, utente) {
                                                    utente.resetNotification = false;
                                                    utente.save(function (err) {
                                                        if (err) {
                                                            res.json({
                                                                success: false,
                                                                message: "Comment can not be created",
                                                                "Caused by ": err
                                                            });
                                                        }
                                                    })
                                                })
                                                elements.notificationStatus = true;
                                                elements.active = true;
                                                elements.disLike_comment_Date = Date.now();
                                                elements.time = Date.now();
                                                elements.user_comment_disLikes.push(user);
                                                elements.save(function (err) {

                                                    if (err) {
                                                        res.json({
                                                            success: false,
                                                            message: "Comment can not be created",
                                                            "Caused by ": err
                                                        });
                                                    }
                                                })
                                                comment.save(function (err) {
                                                    if (err) {
                                                        // Check if any validation errors exists (from user model)
                                                        res.json({
                                                            success: false,
                                                            message: "disLikes canot be created",
                                                            "Caused by ": err
                                                        }); // Display any other errors with validation
                                                    }
                                                    
                                                    
                                                    res.status(200).json({ success: true, message: "disLike added to Comment", "disLikes": comment.disLikes.length, "likes": comment.likes.length });
                                                });
                                            }else{
                                                comment.save(function (err) {
                                                    if (err) {
                                                        // Check if any validation errors exists (from user model)
                                                        res.json({
                                                            success: false,
                                                            message: "disLikes canot be created",
                                                            "Caused by ": err
                                                        }); // Display any other errors with validation
                                                    }
                                                    
                                                    
                                                    res.status(200).json({ success: true, message: "disLike added to Comment", "disLikes": comment.disLikes.length, "likes": comment.likes.length });
                                                });
                                            }
                                            }
                                        }
                                        else return;
                                    }
                                    else return;
                                }
                                    , err => {
                                        if (err) console.log(err);
                                    });
                            }
                                , err => {
                                    if (err) console.log(err);
                                });
                            if (counter === 0) {
                                if (comment.user.toString() != user._id){
                                var notification = new Notification();
                                notification.targetUser = comment.user;
                                notification.disLike_comment_Date = Date.now();
                                notification.typeOf = 'commentDisLike';
                                notification.comment_id = comment._id;
                                notification.user_id = user._id;
                                notification.post_id = comment.post_id;
                                notification.user = user;
                                notification.user_comment_disLikes.push(user);
                                notification.save(function (err) {
                                    if (err) {
                                        res.json({
                                            success: false,
                                            message: "Comment can not be created",
                                            "Caused by ": err
                                        });
                                    }
                                })
                                comment.notification.push(notification);
                                comment.save(function (err) {
                                    if (err) {
                                        // Check if any validation errors exists (from user model)
                                        res.json({
                                            success: false,
                                            message: "disLikes canot be created",
                                            "Caused by ": err
                                        }); // Display any other errors with validation
                                    }
                                    User.findById(comment.user).exec(function (err, utente) {
                                        utente.resetNotification = false;
                                        utente.save(function (err) {
                                            if (err) {
                                                res.json({
                                                    success: false,
                                                    message: "Comment can not be created",
                                                    "Caused by ": err
                                                });
                                            }
                                        })
                                    })
                                    res.status(200).json({ success: true, message: "disLike added to Comment", "disLikes": comment.disLikes.length, "likes": comment.likes.length });
                                });
                            }
                            else{
                                comment.save(function (err) {
                                    if (err) {
                                        // Check if any validation errors exists (from user model)
                                        res.json({
                                            success: false,
                                            message: "disLikes canot be created",
                                            "Caused by ": err
                                        }); // Display any other errors with validation
                                    }
                                   
                                    res.status(200).json({ success: true, message: "disLike added to Comment", "disLikes": comment.disLikes.length, "likes": comment.likes.length });
                                });
                            }
                            }
                            
                        })
                    }




                }
                else {
                    for (var i = comment.disLikes.length - 1; i >= 0; i--) {


                        if (comment.disLikes[i].id == user._id) {
                            comment.disLikes.splice(i, 1);
                            comment.save(function (err, res) {
                                if (err) {
                                    // Check if any validation errors exists (from user model)
                                    res.json({
                                        success: false,
                                        message: "disLike canot be created",
                                        "Caused by ": err
                                    }); // Display any other errors with validation
                                }
                            });
                            res.status(200).json({ success: true, message: "You unDisLiked this Comment", "dislikes": comment.disLikes.length, "likes": comment.likes.length });
                            res.end();
                            count++;
                        }

                    }
                }
                if (count === 0) {
                    comment.disLikes.push(user);
                    for (var i = comment.likes.length - 1; i >= 0; i--) {


                        if (comment.likes[i].id == user._id) {
                            comment.likes.splice(i, 1);
                        }
                    }

                    var counter=0;
                    Notification.find().exec(function (err, notification) {
                        if (err) res.send(err)
                        async.forEachOf(notification, (elements, key, callback) => {
                            async.forEachOf(comment.notification, (notificationId, key, callback) => {

                                if ((notificationId.toString()) == (elements._id.toString())) {
                                    if (elements.typeOf === 'commentDisLike') {
                                        counter++;
                                        var countt = 0;
                                        async.forEachOf(elements.user_comment_disLikes, (usersInArray, key, callback) => {
                                            if ((usersInArray.toString()) == (user._id.toString())) {
                                                countt++;
                                                User.findById(comment.user).exec(function (err, utente) {

                                                    utente.resetNotification = false;
                                                    utente.save(function (err) {
                                                        if (err) {
                                                            res.json({
                                                                success: false,
                                                                message: "Comment can not be created",
                                                                "Caused by ": err
                                                            });
                                                        }
                                                    })
                                                })


                                                elements.disLike_comment_Date = Date.now();
                                                elements.time = Date.now();
                                                elements.notificationStatus = true;
                                                elements.active = true;
                                                elements.save(function (err) {

                                                    if (err) {
                                                        res.json({
                                                            success: false,
                                                            message: "Notification can not be updated",
                                                            "Caused by ": err
                                                        });
                                                    }
                                                })
                                                comment.save(function (err) {
                                                    if (err) {
                                                        // Check if any validation errors exists (from user model)
                                                        res.json({
                                                            success: false,
                                                            message: "disLikes canot be created",
                                                            "Caused by ": err
                                                        }); // Display any other errors with validation
                                                    }
                                                   
                                                    res.status(200).json({ success: true, message: "disLike added to Comment", "disLikes": comment.disLikes.length, "likes": comment.likes.length });
                                                });

                                            }

                                        }, err => {
                                            if (err) console.log(err);
                                        });
                                        if (countt === 0) {
                                            if (comment.user.toString() != user._id){
                                            User.findById(comment.user).exec(function (err, utente) {
                                                utente.resetNotification = false;
                                                utente.save(function (err) {
                                                    if (err) {
                                                        res.json({
                                                            success: false,
                                                            message: "Comment can not be created",
                                                            "Caused by ": err
                                                        });
                                                    }
                                                })
                                            })
                                            elements.disLike_comment_Date = Date.now();
                                            elements.time = Date.now();
                                            elements.notificationStatus = true;
                                            elements.active = true;
                                            elements.user_comment_disLikes.push(user);
                                            elements.save(function (err) {

                                                if (err) {
                                                    res.json({
                                                        success: false,
                                                        message: "Notification can not be updated",
                                                        "Caused by ": err
                                                    });
                                                }
                                            })

                                            comment.save(function (err) {
                                                if (err) {
                                                    // Check if any validation errors exists (from user model)
                                                    res.json({
                                                        success: false,
                                                        message: "disLikes canot be created",
                                                        "Caused by ": err
                                                    }); // Display any other errors with validation
                                                }
                                               
                                                res.status(200).json({ success: true, message: "disLike added to Comment", "disLikes": comment.disLikes.length, "likes": comment.likes.length });
                                            });
                                        }else{
                                            comment.save(function (err) {
                                                if (err) {
                                                    // Check if any validation errors exists (from user model)
                                                    res.json({
                                                        success: false,
                                                        message: "disLikes canot be created",
                                                        "Caused by ": err
                                                    }); // Display any other errors with validation
                                                }
                                               
                                                res.status(200).json({ success: true, message: "disLike added to Comment", "disLikes": comment.disLikes.length, "likes": comment.likes.length });
                                            });
                                        }

                                        }
                                    }
                                    else return;
                                }
                                else return
                            }
                                , err => {
                                    if (err) console.log(err);
                                });
                        }
                            , err => {
                                if (err) console.log(err);
                            });

                            if (counter=== 0) {
                       
                                if (comment.user.toString() != user._id){
                                var notification = new Notification();
                                notification.targetUser = comment.user;
                                notification.disLike_comment_Date = Date.now();
                                notification.typeOf = 'commentDisLike';
                                notification.comment_id = comment._id;
                                notification.post_id = comment.post_id;
                                notification.user_id = user._id;
                                notification.user = user;
                                notification.user_comment_disLikes.push(user);
                                notification.save(function (err) {
                                    if (err) {
                                        res.json({
                                            success: false,
                                            message: "Comment can not be created",
                                            "Caused by ": err
                                        });
                                    }
                                })
                                comment.notification.push(notification);
                                comment.save(function (err) {
                                    if (err) {
                                        // Check if any validation errors exists (from user model)
                                        res.json({
                                            success: false,
                                            message: "disLikes canot be created",
                                            "Caused by ": err
                                        }); // Display any other errors with validation
                                    }
                                    User.findById(comment.user).exec(function (err, utente) {
                                        utente.resetNotification = false;
                                        utente.save(function (err) {
                                            if (err) {
                                                res.json({
                                                    success: false,
                                                    message: "Comment can not be created",
                                                    "Caused by ": err
                                                });
                                            }
                                        })
                                    })
                                    res.status(200).json({ success: true, message: "disLike added to Comment", "disLikes": comment.disLikes.length, "likes": comment.likes.length });
                                });
                            }
                            else{
                                comment.save(function (err) {
                                    if (err) {
                                        // Check if any validation errors exists (from user model)
                                        res.json({
                                            success: false,
                                            message: "disLikes canot be created",
                                            "Caused by ": err
                                        }); // Display any other errors with validation
                                    }
                                    
                                    res.status(200).json({ success: true, message: "disLike added to Comment", "disLikes": comment.disLikes.length, "likes": comment.likes.length });
                                });
                            }

                        }
                    })
                   

                }
            });
        });
    }
};

module.exports.formatComments = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    }
    else {
        Comment.find().exec(function (err, comments) {
            comments.forEach((comment) => {

                User.findById(comment.user_id, function (err, utente) {
                    comment.user = utente;


                    comment.save(function (err) {
                        if (err) {
                            res.json({
                                success: false,
                                message: "Comment can not be updated",
                                "Caused by ": err
                            });
                        }
                    })

                })


            })
            res.status(200).json({
                success: true,
                messsage: "Comment Formated!"
            });
        })
    }
}