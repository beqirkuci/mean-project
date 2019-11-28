var mongoose = require('mongoose');
var Posts = mongoose.model('Posts');
var User = mongoose.model('User');
var Comment = mongoose.model('Comment');
var Messages = mongoose.model('Messages');
var Medias = mongoose.model('Medias');
var async = require("async");
var mongoosePaginate = require('mongoose-paginate');
var Notification = mongoose.model('Notification');


module.exports.bachechaPaginate = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    }
    else {
        var page = req.params.page;
        var perPage = req.params.perPage;



        //const {page ,perPage} = req.query;
        const option = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(perPage, 10) || 10,
            sort: { createdAt: 'desc' },
            populate: [
                { path: 'likes', model: 'User' },
                { path: 'user', model: 'User' },
                { path: 'disLikes', model: 'User' },
                { path: 'images', model: 'Medias' },
                {

                    path: 'comment',
                    populate: [{
                        path: 'likes',
                        model: 'User'
                    },
                    {
                        path: 'disLikes',
                        model: 'User'
                    },
                    {
                        path: 'user',
                        model: 'User',
                    }],
                    sort: { created: 'asc' }
                }
            ]
        }
        Posts.paginate({}, option)
            .then(response => {
                var postmap = [];
                async.forEachOf(response.docs, (value, key, callback) => {
                    async.forEachOf(value.comment, (comm, key, callback) => {
                        async.forEachOf(comm.likes, (likes, key, callback) => {
                            if (likes._id == req.payload._id) {
                                comm.liked = true;
                            }
                        }
                            , err => {
                                if (err) console.log(err);
                            });
                        async.forEachOf(comm.disLikes, (disLikes, key, callback) => {

                            if (disLikes._id == req.payload._id) {
                                comm.disliked = true;
                            }

                        }, err => {
                            if (err) console.log(err);
                        });
                        if (comm.likes != undefined && comm.likes) {
                            comm.numbersOfLikes = comm.likes.length;
                        }
                        else {
                            comm.numbersOfLikes = 0;
                        }
                        if (comm.disLikes != undefined && comm.disLikes) {
                            comm.numbersOfDisLikes = comm.disLikes.length;
                        }
                        else {
                            comm.numbersOfDisLikes = 0;
                        }

                    }, err => {
                        if (err) console.log(err);
                    });
                    async.forEachOf(value.likes, (likes, key, callback) => {

                        if (likes._id == req.payload._id) {
                            value.liked = true;
                        }
                    }
                        , err => {
                            if (err) console.log(err);
                        });
                    async.forEachOf(value.disLikes, (disLikes, key, callback) => {

                        if (disLikes._id == req.payload._id) {
                            value.disliked = true;
                        }
                    }
                        , err => {
                            if (err) console.log(err);
                        });
                    value.numbersOfDisLikes = value.disLikes.length;
                    value.numbersOfLikes = value.likes.length;
                    postmap.push(value);

                }, err => {
                    if (err) console.log(err);

                });


                res.status(200).json({ "posts": postmap, "total": response.total, "limit": response.limit, "page": response.page, "pages": response.pages });

            })
            .catch(console.log("error"));

    }
}

module.exports.addPost = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    } else {

        User.findById(req.payload._id, function (err, utente) {


            var post = new Posts();
            post.user_id = req.payload._id;
            post.name = utente.name;
            post.surname = utente.surname;
            post.caption = req.body.caption;
            post.text = req.body.text;

            post.user = utente;

            if (req.body.image) {

                var img = new Medias();
                img.user_id = req.payload._id;
                img.image = req.body.image;
                img.save(function (err) {
                    if (err) {
                        // Check if any validation errors exists (from user model)
                        res.json({
                            success: false,
                            message: "experience canot be created",
                            "Caused by ": err
                        }); // Display any other errors with validation
                    }
                });
                post.images = img;

            }
            // Save new user to database
            post.save(function (err) {
                if (err) {
                    // Check if any validation errors exists (from user model)
                    res.json({
                        success: false,
                        message: "post canot be created",
                        "Caused by ": err
                    }); // Display any other errors with validation

                } else {
                    if (req.body.image) {
                        Medias.findById(post.images._id, function (err, images) {

                            images.post_id = post._id;

                            images.save(function (err) {
                                if (err) console.log(err)
                            });
                        })

                    }
                    res.status(200);
                    res.json({
                        success: true,
                        messsage: "post created!",
                        "post": post
                    });
                }
            });
        })
    }

};



module.exports.getAllPosts = function (req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    } else {
        Posts.find().sort({ createdAt: 'desc' }).populate('likes').populate('user')
            .populate('images').populate('disLikes')

            .populate({
                path: 'comment',

                populate: [{
                    path: 'likes',
                    model: 'User'
                },
                {
                    path: 'disLikes',
                    model: 'User'
                },
                {
                    path: 'user',
                    model: 'User',
                }],



                sort: { created: 'asc' }

            })
            .exec(function (err, post) {
                var postmap = [];
                if (err) console.log(err)

                async.forEachOf(post, (value, key, callback) => {



                    async.forEachOf(value.comment, (comm, key, callback) => {



                        async.forEachOf(comm.likes, (likes, key, callback) => {

                            if (likes._id == req.payload._id) {
                                comm.liked = true;
                            }
                        }
                            , err => {
                                if (err) console.log(err);
                            });
                        async.forEachOf(comm.disLikes, (disLikes, key, callback) => {

                            if (disLikes._id == req.payload._id) {
                                comm.disliked = true;
                            }

                        }, err => {
                            if (err) console.log(err);
                        });
                        if (comm.likes != undefined && comm.likes) {
                            comm.numbersOfLikes = comm.likes.length;
                        }
                        else {
                            comm.numbersOfLikes = 0;
                        }
                        if (comm.disLikes != undefined && comm.disLikes) {
                            comm.numbersOfDisLikes = comm.disLikes.length;
                        }
                        else {
                            comm.numbersOfDisLikes = 0;
                        }

                    }, err => {
                        if (err) console.log(err);
                    });







                    async.forEachOf(value.likes, (likes, key, callback) => {

                        if (likes._id == req.payload._id) {
                            value.liked = true;
                        }
                    }
                        , err => {
                            if (err) console.log(err);
                        });




                    async.forEachOf(value.disLikes, (disLikes, key, callback) => {

                        if (disLikes._id == req.payload._id) {
                            value.disliked = true;
                        }
                    }
                        , err => {
                            if (err) console.log(err);
                        });







                    value.numbersOfDisLikes = value.disLikes.length;
                    value.numbersOfLikes = value.likes.length;




                    postmap.push(value);




                }, err => {
                    if (err) console.log(err);

                });



                res.status(200).json({ success: true, postmap });



            });



    }

};

module.exports.editPost = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "Private profile"
        });
    } else {
        Posts.findById(req.body._id).populate('images').exec(function (err, post) {
            if (err)
                res.send(err);
            else {
                if (!post) {
                    res.json({
                        success: false,
                        message: 'No post found with id provided '
                    }); // Return error
                } else {


                    if (post.user_id == req.payload._id) {

                        post.caption = req.body.caption;
                        post.text = req.body.text;

                        if (req.body.image) {
                            var img = new Medias();
                            img.user_id = req.payload._id;
                            img.image = req.body.image;
                            img.post_id = post._id;
                            img.save(function (err) {
                                if (err) {
                                    // Check if any validation errors exists (from user model)
                                    res.json({
                                        success: false,
                                        message: "experience canot be created",
                                        "Caused by ": err
                                    }); // Display any other errors with validation
                                }
                            });
                            post.images = img;
                        }
                        post.save(function (err) {
                            if (err)
                                res.send(err);

                            res.status(200).json({
                                success: true,
                                message: "post successfully updated",
                                "post": post
                            });
                        });
                    }
                    else {
                        res.json({ message: "You can not edit others posts" });
                    }
                }
            }
        });

    }

};

module.exports.deletePost = function (req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            "message": "Private profile"
        });
    }
    else {
        var deletedPost = req.params.id;
        Posts.findById(deletedPost, function (err, post) {
            if (err) {
                res.json({
                    success: false,
                    message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!'
                });
            }

            else {
                if (!post) {
                    res.json({
                        success: false,
                        message: 'No post found with id provided '
                    }); // Return error
                }
                else {

                    if (post.notification.length > 0) {

                        Notification.find({ 'post_id': deletedPost }).exec(function (err, notificationToBeDeleted) {
                            notificationToBeDeleted.forEach(function (element) {
                                Notification.findByIdAndRemove(element, function (err) {
                                    if (err) res.send(err)
                                });
                            })

                        })
                    }



                    Medias.find({ 'post_id': deletedPost }).exec(function (err, media) {
                        Medias.findByIdAndRemove(media, function (err) {
                            if (err) res.send(err)
                        });

                    })


                    if (post.comment.length > 0) {
                        Posts.findById(deletedPost).populate('comment').exec(function (err, post) {

                            for (var i = post.comment.length - 1; i >= 0; i--) {

                                Comment.findByIdAndRemove(post.comment[i].id, function (err, comment) {
                                    if (err) res.send(err)
                                });
                            }

                        });

                    }



                    Posts.findByIdAndRemove(deletedPost, function (err, user) {
                        res.json({
                            success: true,
                            message: "Post was successfully deleted"
                        }); // Return success status

                    });



                }
            }
        });
    }
}
module.exports.getPostsByUserId = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: invalid token"
        });
    } else {


        var page = req.params.page;
        var perPage = req.params.perPage;



        //const {page ,perPage} = req.query;
        const option = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(perPage, 10) || 10,
            sort: { createdAt: 'desc' },
            populate: [
                { path: 'likes', model: 'User' },
                { path: 'user', model: 'User' },
                { path: 'disLikes', model: 'User' },
                { path: 'images', model: 'Medias' },
                {

                    path: 'comment',
                    populate: [{
                        path: 'likes',
                        model: 'User'
                    },
                    {
                        path: 'disLikes',
                        model: 'User'
                    },
                    {
                        path: 'user',
                        model: 'User',
                    }],
                    sort: { created: 'asc' }
                }
            ]
        }
        Posts.paginate({ user_id: req.params.id }, option)
            .then(response => {
                var postmap = [];
                async.forEachOf(response.docs, (value, key, callback) => {

                    async.forEachOf(value.comment, (comm, key, callback) => {
                        async.forEachOf(comm.likes, (likes, key, callback) => {
                            if (likes._id == req.payload._id) {
                                comm.liked = true;
                            }
                        }
                            , err => {
                                if (err) console.log(err);
                            });
                        async.forEachOf(comm.disLikes, (disLikes, key, callback) => {

                            if (disLikes._id == req.payload._id) {
                                comm.disliked = true;
                            }

                        }, err => {
                            if (err) console.log(err);
                        });
                        if (comm.likes != undefined && comm.likes) {
                            comm.numbersOfLikes = comm.likes.length;
                        }
                        else {
                            comm.numbersOfLikes = 0;
                        }
                        if (comm.disLikes != undefined && comm.disLikes) {
                            comm.numbersOfDisLikes = comm.disLikes.length;
                        }
                        else {
                            comm.numbersOfDisLikes = 0;
                        }

                    }, err => {
                        if (err) console.log(err);
                    });
                    async.forEachOf(value.likes, (likes, key, callback) => {

                        if (likes._id == req.payload._id) {
                            value.liked = true;
                        }
                    }
                        , err => {
                            if (err) console.log(err);
                        });
                    async.forEachOf(value.disLikes, (disLikes, key, callback) => {

                        if (disLikes._id == req.payload._id) {
                            value.disliked = true;
                        }
                    }
                        , err => {
                            if (err) console.log(err);
                        });
                    value.numbersOfDisLikes = value.disLikes.length;
                    value.numbersOfLikes = value.likes.length;
                    postmap.push(value);

                }, err => {
                    if (err) console.log(err);

                });


                res.status(200).json({ "posts": postmap, "total": response.total, "limit": response.limit, "page": response.page, "pages": response.pages });

            })
            .catch(console.log("error"));

    }

};
module.exports.getImages = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: invalid token"
        });
    } else {
        Posts.find({ user_id: req.params.id }).sort({

            createdAt: 'asc'
        }).exec(function (err, posts) {
            var imageMap = [];
            posts.forEach(function (post) {
                if (post.image)
                    imageMap.push(post.image);
            });
            res.status(200).json(imageMap);
        });
    }

};

module.exports.addLike = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: invalid token"
        });
    } else {
        var logged_user = req.payload._id;
        Posts.findByIdAndUpdate(req.params.postId).populate('likes').populate('disLikes').exec(function (err, post) {
            User.findById(logged_user).exec(function (req, user) {
                var count = 0;
                if (post.likes === undefined || post.likes.length == 0) {
                    count++;
                    post.likes.push(user);
                    for (var i = post.disLikes.length - 1; i >= 0; i--) {


                        if (post.disLikes[i].id == user._id) {
                            post.disLikes.splice(i, 1);
                        }
                    }

                    if (post.notification.length == 0) {
                        if (post.user.toString() != user._id) {
                            var notification = new Notification();
                            notification.targetUser = post.user;
                            notification.like_Date = Date.now();
                            notification.typeOf = 'Like';
                            notification.post_id = post._id;
                            notification.user_id = user._id;
                            notification.user = user;
                            notification.user_likes.push(user);
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
                                    // Check if any validation errors exists (from user model)
                                    res.json({
                                        success: false,
                                        message: "likes canot be created",
                                        "Caused by ": err
                                    }); // Display any other errors with validation
                                }
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
                                res.status(200).json({ success: true, message: "like added", "likes": post.likes.length, "disLikes": post.disLikes.length });
                            });
                        }
                        else {
                            post.save(function (err) {
                                if (err) {
                                    console.log(err)
                                }
                                else {
                                    res.status(200).json(
                                        {
                                            success: true, message: "like added",
                                            "likes": post.likes.length,
                                            "disLikes": post.disLikes.length
                                        });
                                }
                            });

                        }
                    }
                    else {

                        var counter = 0;
                        Notification.find().exec(function (err, notification) {
                            if (err) res.send(err)
                            async.forEachOf(notification, (elements, key, callback) => {
                                async.forEachOf(post.notification, (notificationId, key, callback) => {

                                    if ((notificationId.toString()) == (elements._id.toString())) {
                                        if (elements.typeOf === 'Like') {
                                            counter++;
                                            var countt = 0;
                                            async.forEachOf(elements.user_likes, (usersInArray, key, callback) => {
                                                if ((usersInArray.toString()) == (user._id.toString())) {

                                                    User.findById(post.user).exec(function (err, targetuserr) {

                                                        targetuserr.resetNotification = false;
                                                        targetuserr.save(function (err) {
                                                            if (err) {
                                                                // Check if any validation errors exists (from user model)
                                                                res.json({
                                                                    success: false,
                                                                    message: "likes canot be created",
                                                                    "Caused by ": err
                                                                }); // Display any other errors with validation
                                                            }
                                                        })
                                                    })
                                                    elements.notificationStatus = true;
                                                    elements.active = true;
                                                    elements.like_Date = Date.now();
                                                    elements.time = Date.now();
                                                    elements.save(function (err) {
                                                        if (err) {
                                                            res.json({
                                                                success: false,
                                                                message: "Comment can not be created",
                                                                "Caused by ": err
                                                            });
                                                        }
                                                    })
                                                    countt++;
                                                    post.save(function (err) {
                                                        if (err) {
                                                            console.log(err)
                                                        }
                                                       
                                                        res.status(200).json({ success: true, message: "like added", "likes": post.likes.length, "disLikes": post.disLikes.length });
                                                    });
                                                }

                                            }, err => {
                                                if (err) console.log(err);
                                            });
                                            if (countt === 0) {
                                                if (post.user.toString() != user._id){
                                                User.findById(post.user).exec(function (err, targetuserr) {

                                                    targetuserr.resetNotification = false;
                                                    targetuserr.save(function (err) {
                                                        if (err) {
                                                            // Check if any validation errors exists (from user model)
                                                            res.json({
                                                                success: false,
                                                                message: "likes canot be created",
                                                                "Caused by ": err
                                                            }); // Display any other errors with validation
                                                        }
                                                    })
                                                })
                                                elements.notificationStatus = true;
                                                elements.active = true;
                                                elements.like_Date = Date.now();
                                                elements.time = Date.now();
                                                elements.user_likes.push(user);
                                                elements.save(function (err) {
                                                    if (err) {
                                                        res.json({
                                                            success: false,
                                                            message: "Comment can not be created",
                                                            "Caused by ": err
                                                        });
                                                    }
                                                })
                                                post.save(function (err) {
                                                    if (err) {
                                                        console.log(err)
                                                    }
                                                   
                                                    res.status(200).json({ success: true, message: "like added", "likes": post.likes.length, "disLikes": post.disLikes.length });
                                                });
                                            }
                                            else{
                                                post.save(function (err) {
                                                    if (err) {
                                                        console.log(err)
                                                    }
                                                   
                                                    res.status(200).json({ success: true, message: "like added", "likes": post.likes.length, "disLikes": post.disLikes.length });
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
                                
                                if (post.user.toString() != user._id){
                                var notification = new Notification();
                                notification.targetUser = post.user;
                                notification.like_Date = Date.now();
                                notification.typeOf = 'Like';
                                notification.post_id = post._id;
                                notification.user_id = user._id;
                                notification.user = user;
                                notification.user_likes.push(user);
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
                                        // Check if any validation errors exists (from user model)
                                        res.json({
                                            success: false,
                                            message: "likes canot be created",
                                            "Caused by ": err
                                        }); // Display any other errors with validation
                                    }
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
                                    res.status(200).json({ success: true, message: "like added", "likes": post.likes.length, "disLikes": post.disLikes.length });
                                });
                            }
                            else{
                                post.save(function (err) {
                                    if (err) {
                                        // Check if any validation errors exists (from user model)
                                        res.json({
                                            success: false,
                                            message: "likes canot be created",
                                            "Caused by ": err
                                        }); // Display any other errors with validation
                                    }
                                    
                                    res.status(200).json({ success: true, message: "like added", "likes": post.likes.length, "disLikes": post.disLikes.length });
                                });
                            }
                            }
                           
                            
                        })

                    }
                }
                else {
                    for (var i = post.likes.length - 1; i >= 0; i--) {
                        if (post.likes[i].id == user._id) {
                            post.likes.splice(i, 1);
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
                            res.status(200).json({ success: true, message: "You have Unliked this post", "likes": post.likes.length, "disLikes": post.disLikes.length });
                            res.end();
                            count++;
                        }
                    }
                }
                if (count === 0) {
                    post.likes.push(user);
                    for (var i = post.disLikes.length - 1; i >= 0; i--) {
                        if (post.disLikes[i].id == user._id) {
                            post.disLikes.splice(i, 1);
                        }
                    }
                    var counter = 0;

                    Notification.find().exec(function (err, notification) {
                        if (err) res.send(err)
                        async.forEachOf(notification, (elements, key, callback) => {
                            async.forEachOf(post.notification, (notificationId, key, callback) => {

                                if ((notificationId.toString()) == (elements._id.toString())) {
                                    if (elements.typeOf === 'Like') {
                                        counter++;
                                        var countt = 0;
                                        async.forEachOf(elements.user_likes, (usersInArray, key, callback) => {
                                            if ((usersInArray.toString()) == (user._id.toString())) {

                                                User.findById(post.user).exec(function (err, targetuserr) {

                                                    targetuserr.resetNotification = false;
                                                    targetuserr.save(function (err) {
                                                        if (err) {
                                                            // Check if any validation errors exists (from user model)
                                                            res.json({
                                                                success: false,
                                                                message: "likes canot be created",
                                                                "Caused by ": err
                                                            }); // Display any other errors with validation
                                                        }
                                                    })
                                                })
                                                elements.like_Date = Date.now();
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
                                                countt++;
                                                post.save(function (err) {
                                                    if (err) {
                                                        console.log(err)
                                                    }
                                                   
                                                    res.status(200).json({ success: true, message: "like added", "likes": post.likes.length, "disLikes": post.disLikes.length });
                                                });
                                            }

                                        });
                                        if (countt === 0) {
                                            if (post.user.toString() != user._id) {
                                            User.findById(post.user).exec(function (err, targetuserr) {

                                                targetuserr.resetNotification = false;
                                                targetuserr.save(function (err) {
                                                    if (err) {
                                                        // Check if any validation errors exists (from user model)
                                                        res.json({
                                                            success: false,
                                                            message: "likes canot be created",
                                                            "Caused by ": err
                                                        }); // Display any other errors with validation
                                                    }
                                                })
                                            })
                                            elements.like_Date = Date.now();
                                            elements.time = Date.now();
                                            elements.notificationStatus = true;
                                            elements.active = true;
                                            elements.user_likes.push(user);
                                            elements.save(function (err) {
                                                if (err) {
                                                    res.json({
                                                        success: false,
                                                        message: "Notification can not be updated",
                                                        "Caused by ": err
                                                    });
                                                }
                                            })
                                            post.save(function (err) {
                                                if (err) {
                                                    console.log(err)
                                                }
                                               
                                                res.status(200).json({ success: true, message: "like added", "likes": post.likes.length, "disLikes": post.disLikes.length });
                                            });
                                        }
                                        else{
                                            post.save(function (err) {
                                                if (err) {
                                                    console.log(err)
                                                }
                                               
                                                res.status(200).json({ success: true, message: "like added", "likes": post.likes.length, "disLikes": post.disLikes.length });
                                            });
                                        }
                                        }
                                    }
                                    else return;
                                }
                                else return
                            });
                        });

                        if (counter === 0) {

                            if (post.user.toString() != user._id) {
                                var notification = new Notification();
                                notification.targetUser = post.user;
                                notification.like_Date = Date.now();
                                notification.typeOf = 'Like';
                                notification.post_id = post._id;
                                notification.user_id = user._id;
                                notification.user = user;
                                notification.user_likes.push(user);
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
                                        // Check if any validation errors exists (from user model)
                                        res.json({
                                            success: false,
                                            message: "likes canot be created",
                                            "Caused by ": err
                                        }); // Display any other errors with validation
                                    }
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
                                    res.status(200).json({ success: true, message: "like added", "likes": post.likes.length, "disLikes": post.disLikes.length });
                                });
                            }
                            else {
                                post.save(function (err) {
                                    if (err) {
                                        console.log(err)
                                    }
                                    else {
                                        res.status(200).json(
                                            {
                                                success: true, message: "like added",
                                                "likes": post.likes.length,
                                                "disLikes": post.disLikes.length
                                            });
                                    }
                                });
    
                            }
                        }
                    })
                    
                }
            });
        });
    }
};

module.exports.addDislike = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: invalid token"
        });
    } else {
        var logged_user = req.payload._id;
        Posts.findByIdAndUpdate(req.params.postId).populate('disLikes').populate('likes').exec(function (err, post) {
            User.findById(logged_user).exec(function (req, user) {

                var count = 0;
                if (post.disLikes === undefined || post.disLikes.length == 0) {
                    count++;
                    post.disLikes.push(user);
                    for (var i = post.likes.length - 1; i >= 0; i--) {
                        if (post.likes[i].id == user._id) {
                            post.likes.splice(i, 1);
                        }
                    }
                    if (post.notification.length === 0) {
                        if (post.user.toString() != user._id) {
                        var notification = new Notification();
                        notification.targetUser = post.user;
                        notification.disLike_Date = Date.now();
                        notification.typeOf = 'disLike';
                        notification.post_id = post._id;
                        notification.user_id = user._id;
                        notification.user = user;
                        notification.user_disLikes.push(user);
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
                                // Check if any validation errors exists (from user model)
                                res.json({
                                    success: false,
                                    message: "disLikes canot be created",
                                    "Caused by ": err
                                }); // Display any other errors with validation
                            }
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
                            res.status(200).json({ success: true, message: "disLike added", "disLikes": post.disLikes.length, "likes": post.likes.length });
                        });
                    }
                    else{
                    
                        post.save(function (err) {
                            if (err) {
                                console.log(err)
                            }
                            else {
                                res.status(200).json({ 
                                    success: true, 
                                    message: "disLike added", 
                                    "disLikes": post.disLikes.length, 
                                    "likes": post.likes.length });

                            }
                        });
                    }
                    }
                    else {
                        var counter = 0;
                        Notification.find().exec(function (err, notification) {
                            if (err) res.send(err)
                            async.forEachOf(notification, (elements, key, callback) => {
                                async.forEachOf(post.notification, (notificationId, key, callback) => {

                                    if ((notificationId.toString()) == (elements._id.toString())) {
                                        if (elements.typeOf === 'disLike') {
                                            counter++;
                                            var countt = 0;
                                            async.forEachOf(elements.user_disLikes, (usersInArray, key, callback) => {
                                                if ((usersInArray.toString()) == (user._id.toString())) {
                                                    countt++;
                                                    elements.notificationStatus = true;
                                                    elements.active = true;
                                                    elements.disLike_Date = Date.now();
                                                    elements.time = Date.now();
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
                                                                message: "disLike added", 
                                                                "disLikes": post.disLikes.length, 
                                                                "likes": post.likes.length });
                            
                                                        }
                                                    });

                                                }

                                            }, err => {
                                                if (err) console.log(err);
                                            });
                                            if (countt === 0) {
                                                if (post.user.toString() != user._id){
                                                elements.notificationStatus = true;
                                                elements.active = true;
                                                elements.disLike_Date = Date.now();
                                                elements.time = Date.now();
                                                elements.user_disLikes.push(user);
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
                                                            message: "disLike added", 
                                                            "disLikes": post.disLikes.length, 
                                                            "likes": post.likes.length });
                        
                                                    }
                                                });

                                            }
                                            else{
                                                post.save(function (err) {
                                                    if (err) {
                                                        console.log(err)
                                                    }
                                                    else {
                                                        res.status(200).json({ 
                                                            success: true, 
                                                            message: "disLike added", 
                                                            "disLikes": post.disLikes.length, 
                                                            "likes": post.likes.length });
                        
                                                    }
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
                                if (post.user.toString() != user._id){
                                var notification = new Notification();
                                notification.targetUser = post.user;
                                notification.disLike_Date = Date.now();
                                notification.typeOf = 'disLike';
                                notification.post_id = post._id;
                                notification.user_id = user._id;
                                notification.user = user;
                                notification.user_disLikes.push(user);
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
                                        // Check if any validation errors exists (from user model)
                                        res.json({
                                            success: false,
                                            message: "disLikes canot be created",
                                            "Caused by ": err
                                        }); // Display any other errors with validation
                                    }
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
                                    res.status(200).json({ success: true, message: "disLike added", "disLikes": post.disLikes.length, "likes": post.likes.length });
                                });
                            }
                            else{
                                post.save(function (err) {
                                    if (err) {
                                        console.log(err)
                                    }
                                    else {
                                        res.status(200).json({ 
                                            success: true, 
                                            message: "disLike added", 
                                            "disLikes": post.disLikes.length, 
                                            "likes": post.likes.length });
        
                                    }
                                });
                            }
                            
                            }
                            
                        })
                    }
                }
                else {
                    for (var i = post.disLikes.length - 1; i >= 0; i--) {
                        if (post.disLikes[i].id == user._id) {
                            post.disLikes.splice(i, 1);
                            post.save(function (err, res) {
                                if (err) {
                                    // Check if any validation errors exists (from user model)
                                    res.json({
                                        success: false,
                                        message: "disLike canot be created",
                                        "Caused by ": err
                                    }); // Display any other errors with validation
                                }
                            });
                            res.status(200).json({ success: true, message: "You unDisLiked this post", "dislikes": post.disLikes.length, "likes": post.likes.length });
                            res.end();
                            count++;
                        }
                    }
                }
                if (count === 0) {
                    post.disLikes.push(user);
                    for (var i = post.likes.length - 1; i >= 0; i--) {


                        if (post.likes[i].id == user._id) {
                            post.likes.splice(i, 1);
                        }
                    }
                    var counter=0;
                    Notification.find().exec(function (err, notification) {
                        if (err) res.send(err)
                        async.forEachOf(notification, (elements, key, callback) => {
                            async.forEachOf(post.notification, (notificationId, key, callback) => {

                                if ((notificationId.toString()) == (elements._id.toString())) {
                                    if (elements.typeOf === 'disLike') {
                                        counter++;
                                        var countt = 0;
                                        async.forEachOf(elements.user_disLikes, (usersInArray, key, callback) => {
                                            if ((usersInArray.toString()) == (user._id.toString())) {
                                                countt++;
                                                elements.notificationStatus = true;
                                                elements.active = true;
                                                elements.disLike_Date = Date.now();
                                                elements.time = Date.now();

                                                elements.save(function (err) {
                                                    if (err) {
                                                        res.json({
                                                            success: false,
                                                            message: "Notification can not be updated",
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
                                                        // Check if any validation errors exists (from user model)
                                                        res.json({
                                                            success: false,
                                                            message: "disLikes canot be created",
                                                            "Caused by ": err
                                                        }); // Display any other errors with validation
                                                    }
                                                   
                                                    res.status(200).json({ success: true, message: "disLike added", "disLikes": post.disLikes.length, "likes": post.likes.length });
                                                });

                                            }

                                        }, err => {
                                            if (err) console.log(err);
                                        });
                                        if (countt === 0) {
                                            if (post.user.toString() != user._id){
                                            elements.disLike_Date = Date.now();
                                            elements.time = Date.now();
                                            elements.notificationStatus = true;
                                            elements.active = true;
                                            elements.user_disLikes.push(user);
                                            elements.save(function (err) {
                                                if (err) {
                                                    res.json({
                                                        success: false,
                                                        message: "Notification can not be updated",
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
                                                    // Check if any validation errors exists (from user model)
                                                    res.json({
                                                        success: false,
                                                        message: "disLikes canot be created",
                                                        "Caused by ": err
                                                    }); // Display any other errors with validation
                                                }
                                               
                                                res.status(200).json({ success: true, message: "disLike added", "disLikes": post.disLikes.length, "likes": post.likes.length });
                                            });
                                        }
                                        else{
                                            post.save(function (err) {
                                                if (err) {
                                                    // Check if any validation errors exists (from user model)
                                                    res.json({
                                                        success: false,
                                                        message: "disLikes canot be created",
                                                        "Caused by ": err
                                                    }); // Display any other errors with validation
                                                }
                                               
                                                res.status(200).json({ success: true, message: "disLike added", "disLikes": post.disLikes.length, "likes": post.likes.length });
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

                                if (post.user.toString() != user._id) {
                                    var notification = new Notification();
                                    notification.targetUser = post.user;
                                    notification.disLike_Date = Date.now();
                                    notification.typeOf = 'disLike';
                                    notification.post_id = post._id;
                                    notification.user_id = user._id;
                                    notification.user = user;
                                    notification.user_disLikes.push(user);
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
                                            // Check if any validation errors exists (from user model)
                                            res.json({
                                                success: false,
                                                message: "likes canot be created",
                                                "Caused by ": err
                                            }); // Display any other errors with validation
                                        }
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
                                        res.status(200).json({ success: true, message: "disLike added", "disLikes": post.disLikes.length, "likes": post.likes.length });
                                    });
                                }
                                else {
                                    post.save(function (err) {
                                        if (err) {
                                            console.log(err)
                                        }
                                        else {
                                            res.status(200).json({ success: true, message: "disLike added", "disLikes": post.disLikes.length, "likes": post.likes.length });

                                        }
                                    });
        
                                }
                            }

                    })
                  
                }
            });
        });
    }
};


module.exports.banPost = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "Private profile"
        });
    }
    else {
        var postId = req.params.id;

        User.findById(req.payload._id, function (err, user) {

            Posts.findById(postId, function (err, post) {
                var msg = new Messages({
                    user: user,
                    title: "Ban reason",
                    content: req.body.content,
                    type: "Ban",
                    post: post

                });
                msg.experiences = undefined;

                msg.save(function (err) {
                    if (err) {
                        // Check if any validation errors exists (from user model)
                        res.json({
                            success: false,
                            message: "Experince canot be created",
                            "Caused by ": err
                        }); // Display any other errors with validation

                    }
                });


                res.status(200).json({
                    success: true,
                    messsage: "ban sent successffully!",
                    "post": post
                });
            })
        })
    }
}



module.exports.professionalPosts = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "Private profile"
        });
    }
    else {

        Posts.find().sort({ createdAt: 'desc' }).populate('user')
            .populate('images')
            .exec(function (err, post) {
                var postmap = [];
                if (err) console.log(err)
                else {
                    async.forEachOf(post, (value, key, callback) => {
                        if (value.user.permission === 'professional') {
                            postmap.push(value);
                        }
                    }, err => {
                        if (err) console.log(err);

                    });

                    res.status(200).json({ success: true, "posts": postmap })
                }

            });


    }
}
module.exports.stafPosts = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "Private profile"
        });
    }
    else {
        Posts.find().sort({ createdAt: 'desc' }).populate('likes').populate('user')
            .populate('images').populate('disLikes')

            .populate({
                path: 'comment',

                populate: [{
                    path: 'likes',
                    model: 'User'
                },
                {
                    path: 'disLikes',
                    model: 'User'
                },
                {
                    path: 'user',
                    model: 'User',
                }],



                sort: { created: 'asc' }

            })
            .exec(function (err, post) {
                var postmap = [];
                if (err) console.log(err)

                async.forEachOf(post, (value, key, callback) => {

                    if (value.user && value.user.permission === 'staff') {



                        async.forEachOf(value.comment, (comm, key, callback) => {



                            async.forEachOf(comm.likes, (likes, key, callback) => {

                                if (likes._id == req.payload._id) {
                                    comm.liked = true;
                                }
                            }
                                , err => {
                                    if (err) console.log(err);
                                });
                            async.forEachOf(comm.disLikes, (disLikes, key, callback) => {

                                if (disLikes._id == req.payload._id) {
                                    comm.disliked = true;
                                }

                            }, err => {
                                if (err) console.log(err);
                            });
                            if (comm.likes != undefined && comm.likes) {
                                comm.numbersOfLikes = comm.likes.length;
                            }
                            else {
                                comm.numbersOfLikes = 0;
                            }
                            if (comm.disLikes != undefined && comm.disLikes) {
                                comm.numbersOfDisLikes = comm.disLikes.length;
                            }
                            else {
                                comm.numbersOfDisLikes = 0;
                            }

                        }, err => {
                            if (err) console.log(err);
                        });







                        async.forEachOf(value.likes, (likes, key, callback) => {

                            if (likes._id == req.payload._id) {
                                value.liked = true;
                            }
                        }
                            , err => {
                                if (err) console.log(err);
                            });




                        async.forEachOf(value.disLikes, (disLikes, key, callback) => {

                            if (disLikes._id == req.payload._id) {
                                value.disliked = true;
                            }
                        }
                            , err => {
                                if (err) console.log(err);
                            });


                        value.numbersOfDisLikes = value.disLikes.length;
                        value.numbersOfLikes = value.likes.length;

                        postmap.push(value);
                    }
                }, err => {
                    if (err) console.log(err);

                });



                res.status(200).json({ success: true, "posts": postmap })



            });
    }
}




module.exports.changeMedia = function (req, res) {

    Posts.find().sort({ createdAt: 'desc' }).populate('likes').populate('user').populate('images').populate('comment', '', null, { sort: { created: 'asc' } }).exec(function (err, post) {
        if (err) console.log(err)
        post.forEach(function (element) {


            if (element.image && !element.images) {

                var img = new Medias();
                img.user_id = element.user_id;
                img.image = element.image;
                img.post_id = element._id;
                img.save(function (err) {
                    if (err) {
                        // Check if any validation errors exists (from user model)
                        res.json({
                            success: false,
                            message: "experience canot be created",
                            "Caused by ": err
                        }); // Display any other errors with validation
                    }
                });
                element.images = img;

            }
            element.save(function (err) {
                if (err)
                    res.send(err);

            });


        })
        res.status(200).json({ message: "all users updated successfully", post })
    })





}


module.exports.redazionePosts = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "Private profile"
        });
    }
    else {
        Posts.find().sort({ createdAt: 'desc' }).populate('likes').populate('user')
            .populate('images').populate('disLikes').populate({
                path: 'comment',

                populate: [{
                    path: 'likes',
                    model: 'User'
                },
                {
                    path: 'disLikes',
                    model: 'User'
                },
                {
                    path: 'user',
                    model: 'User',
                }],



                sort: { created: 'asc' }

            })
            .exec(function (err, post) {
            
                var postmap = [];
                if (err) console.log(err)
                if(post.length >0){
                    console.log(post);
                async.forEachOf(post, (value, key, callback) => {
               
                    if (value.user && value.user.permission === 'redazione') {



                        async.forEachOf(value.comment, (comm, key, callback) => {



                            async.forEachOf(comm.likes, (likes, key, callback) => {

                                if (likes._id == req.payload._id) {
                                    comm.liked = true;
                                }
                            }
                                , err => {
                                    if (err) console.log(err);
                                });
                            async.forEachOf(comm.disLikes, (disLikes, key, callback) => {

                                if (disLikes._id == req.payload._id) {
                                    comm.disliked = true;
                                }

                            }, err => {
                                if (err) console.log(err);
                            });
                            if (comm.likes != undefined && comm.likes) {
                                comm.numbersOfLikes = comm.likes.length;
                            }
                            else {
                                comm.numbersOfLikes = 0;
                            }
                            if (comm.disLikes != undefined && comm.disLikes) {
                                comm.numbersOfDisLikes = comm.disLikes.length;
                            }
                            else {
                                comm.numbersOfDisLikes = 0;
                            }

                        }, err => {
                            if (err) console.log(err);
                        });







                        async.forEachOf(value.likes, (likes, key, callback) => {

                            if (likes._id == req.payload._id) {
                                value.liked = true;
                            }
                        }
                            , err => {
                                if (err) console.log(err);
                            });




                        async.forEachOf(value.disLikes, (disLikes, key, callback) => {

                            if (disLikes._id == req.payload._id) {
                                value.disliked = true;
                            }
                        }
                            , err => {
                                if (err) console.log(err);
                            });


                        value.numbersOfDisLikes = value.disLikes.length;
                        value.numbersOfLikes = value.likes.length;

                        postmap.push(value);
                    }
                }, err => {
                    if (err) console.log(err);

                });
                res.status(200).json({ success: true, "posts": postmap })
                }else{
                    res.status(200).json({ success: true, "posts": postmap ,message:"there no post with role redazione"})
                }

               



            });
    }
}
