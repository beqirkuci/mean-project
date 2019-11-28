var mongoose = require('mongoose');
var User = mongoose.model('User');
var Experiences = mongoose.model('Experiences');
var Messages = mongoose.model('Messages');
var PrivateData = mongoose.model('PrivateData');
var Posts = mongoose.model('Posts');
var Timeline = mongoose.model('Timeline');
var Comment = mongoose.model('Comment');
var Medias = mongoose.model('Medias');
var conversationNotifications = mongoose.model('ConversationNotifications');

var mongoosePaginate = require('mongoose-paginate');
var async = require("async");




module.exports.sharePrivateData = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    }
    else {
        var sharedataId = req.params.id;
        User.findById(req.payload._id, function (err, user) {
            if (user.privateDataArray.length == 0) {
                user.privateDataArray.push(sharedataId);
                user.save(function (err) {
                    if (err) {
                        // Check if any validation errors exists (from user model)
                        res.json({
                            success: false,
                            message: "user canot be saved",
                            "Caused by ": err
                        }); // Display any other errors with validation

                    } else {
                        res.status(200);
                        res.json({
                            success: true,
                            messsage: "you shared information successfully!"
                        });
                    }
                });
            }
            else if (user.privateDataArray.length > 0) {

                var count = 0;
                user.privateDataArray.forEach(function (element) {
                    if (element == sharedataId) {
                        res.status(200).json({ success: false, message: "you have shared once private data with this user" })
                        count++;
                    }

                })



                if (count == 0) {
                    user.privateDataArray.push(sharedataId);
                    user.save(function (err) {
                        if (err) {
                            // Check if any validation errors exists (from user model)
                            res.json({
                                success: false,
                                message: "user canot be saved",
                                "Caused by ": err
                            }); // Display any other errors with validation

                        } else {
                            res.status(200);
                            res.json({
                                success: true,
                                messsage: "you shared information successfully!"
                            });
                        }
                    });
                }

            }


        })

    }
}

module.exports.getAllUsers = function (req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    } else {
        var active = 0;
        var nonActive = 0;
        User.count({ "active": true }, function (err, c) {
            active = c;
        });
        User.count({ "active": false }, function (err, counter) {
            nonActive = counter;
        });

        var page = req.params.page;
        var perPage = req.params.perPage;


        const option = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(perPage, 10) || 10,
            sort: { name: 'asc' }

        }
        var namee =req.params.name;
        
        let query = [
            { 'name': { $regex: new RegExp(namee, "i") } },
            { 'surname': { $regex: new RegExp(namee, "i") } },
            { 'email': { $regex: new RegExp(namee, "i") } },
        ]
        User.paginate({ $or: query }, option)
            .then(response => {
                var userMap = [];

                async.forEachOf(response.docs, (users, key, callback) => {
                    if (users.permission != 'admin') {

                        userMap.push(users);
                    }
                }, err => {
                    if (err) console.log(err);
                });
                res.status(200).json({ "activeUsers": active, "nonActiveUsers": nonActive, "allUsers": userMap, "total": response.total, "limit": response.limit, "page": response.page, "pages": response.pages });
            }).catch(console.log("error"));

    }
};

module.exports.getUsers = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    } else {
        var active = 0;
        var nonActive = 0;
        User.count({ "active": true }, function (err, c) {
            active = c;
        });
        User.count({ "active": false }, function (err, counter) {
            nonActive = counter;
        });

        User.find({}, '_id name surname profilePic permission active gender email online').sort([['name', 1],['surname',1]]).exec(function (err, users) {

            if (err) console - log(err);
            else
                res.status(200).json({"users":users,'active':active,'nonActive':nonActive});

        });


    }
};







module.exports.updateUserRole = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "Private profile"
        });
    } else {

        User.findById(req.body._id, function (err, user) {

            if (err)
                res.send(err);

            user.permission = req.body.permission; // update the bears info

            // save the bear
            user.save(function (err) {
                if (err)
                    res.send(err);

                res.status(200).json(user);
            });

        });



    }

};
//edit user
module.exports.editUser = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "Private profile"
        });
    } else {

        User.findById(req.body._id).populate('privateData').exec(function (err, user) {


            if (err) res.send(err);
            else if (!user) {
                res.status(200).json({ success: false, message: "can not find user, id is wrong" })
            }
            else {

                user.permission = req.body.permission;
                user.name = req.body.name;
                user.surname = req.body.surname;
                user.telMobile = req.body.telMobile;
                user.maritalStatus = req.body.maritalStatus;
                user.placeOfBirth = req.body.placeOfBirth;
                user.email2 = req.body.email2;
                user.telOffice = req.body.telOffice;
                user.address = req.body.address;
                user.profession = req.body.profession;
                user.gender = req.body.gender;
                user.dateOfBirth = req.body.dateOfBirth;
                user.profilePic = req.body.profilePic;
                user.nickname = req.body.nickname;
                user.placeOfResidence = req.body.placeOfResidence;
                user.sharedMyData = false;
                user.isEmailPrivate = req.body.isEmailPrivate;
                user.isTelPrivate = req.body.isTelPrivate;
                user.titleOfStudies = req.body.titleOfStudies;
                user.addressOfLiving = req.body.addressOfLiving;
                user.registrationNumber = req.body.registrationNumber;
                var privateData = user.privateData;
                BMIService = require('../services/BMIService');
                if (req.body.weight && req.body.height && req.body.height != 0 && req.body.weight != 0) {
                    var bmiIndex = BMIService.getIndex(parseFloat(req.body.weight), parseFloat(req.body.height));
                    var BMIdescription = BMIService.getDescription(bmiIndex);
                }
                //checking if private date for user logged in exiss
                if (privateData && privateData._id) {
                    privateData.height = req.body.height;
                    privateData.weight = req.body.weight;
                    privateData.bmi = bmiIndex;
                    privateData.description = BMIdescription;

                } else {       //if private data does not exist for user logged in
                    privateData = new PrivateData({
                        user_id: user._id,
                        height: req.body.height,
                        weight: req.body.weight,
                        bmi: bmiIndex,
                        description: BMIdescription
                    });
                }
                //saving updated private datas
                if (privateData) {
                    privateData.save(function (err) {

                        if (err) {
                            res.json({ success: false, "Caused by ": err }); // Display any other errors with validation

                        }
                    })
                }
                user.privateData = privateData;

                if (req.body.experiences && req.body.experiences.length > 0) {

                    req.body.experiences.forEach(function (experience) {
                        var exp = new Experiences(experience);
                        if (experience._id) {

                            Experiences.findById(experience._id).exec(function (err, existingExp) {



                                existingExp.path = experience.path;
                                existingExp.experience = experience.experience;
                                existingExp.from = experience.from;
                                existingExp.to = experience.to;
                                existingExp.title = experience.title;
                                existingExp.workHere = experience.workHere;

                                existingExp.save(function (err) {
                                    if (err) {
                                        // Check if any validation errors exists (from user model)
                                        res.json({
                                            success: false,
                                            message: "experience canot be created",
                                            "Caused by ": err
                                        }); // Display any other errors with validation

                                    }
                                });

                            });

                        }
                    });

                }








                // save the updated fields
                user.save(function (err) {
                    if (err)
                        res.send(err);

                    res.status(200).json({
                        success: true,
                        message: "User successfully updated",
                    });
                });
            }

        });



    }


};

// Route to delete a user
module.exports.deleteUser = function (req, res) {
    var deletedUser = req.params.id; // Assign the username from request parameters to a variable
    User.findById(req.params.id).populate('privateData').populate('experiences').exec(function (err, user) {
        if (err) {
            console.log(err);
            // Function to send e-mail to myself
            res.json({
                success: false,
                message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!'
            });
        } else {
            // Check if current user was found in database
            if (!user) {
                res.json({
                    success: false,
                    message: 'No user found with id provided '
                }); // Return error
            } else {
                // Fine the user that needs to be deleted
                if (user.privateData) {
                    PrivateData.findByIdAndRemove(user.privateData._id, function (err, user) {
                        if (err) {
                            console.log(err);
                        }
                    });

                }

                Comment.find({ "user_id": user._id }).exec(function (err, comments) {
                    if (comments && comments.length > 0) {
                        comments.forEach(function (com) {
                            Comment.findByIdAndRemove(com._id, function (err, user) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        });
                    }
                });
                Timeline.find({ "user_id": user._id }).exec(function (err, timelines) {
                    if (timelines && timelines.length > 0) {
                        timelines.forEach(function (tim) {
                            Timeline.findByIdAndRemove(tim._id, function (err, user) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        });
                    }
                });
                Messages.find({ "user_id": user._id }).exec(function (err, messages) {
                    if (messages && messages.length > 0) {
                        messages.forEach(function (mesg) {
                            Messages.findByIdAndRemove(mesg._id, function (err, user) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        });
                    }
                });
                Medias.find({ "user_id": user._id }).exec(function (err, media) {
                    if (media && media.length > 0) {
                        media.forEach(function (med) {
                            Medias.findByIdAndRemove(med._id, function (err, media) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        });
                    }
                });
                Posts.find({ "user_id": user._id }).exec(function (err, posts) {
                    if (posts && posts.length > 0) {
                        posts.forEach(function (post) {
                            Posts.findByIdAndRemove(post._id, function (err, user) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        });
                    }
                });


                if (user.experiences && user.experiences.length > 0) {
                    user.experiences.forEach(function (exp) {
                        Experiences.findByIdAndRemove(exp._id, function (err, user) {
                            if (err) {
                                console.log(err);
                            }
                        });
                    });

                }




                User.findByIdAndRemove(deletedUser, function (err, user) {
                    if (err) {
                        res.json({
                            success: false,
                            message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!'
                        });
                    } else {
                        res.json({
                            success: true,
                            message: "user was successfully deleted",
                            "user": user
                        }); // Return success status
                    }
                });
            }
        }
    });
};

module.exports.addUserExperiences = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "Private profile"
        });
    } else {
        User.findById(req.payload._id).exec(function (err, user) {

            var msg = new Messages({
                user_id: req.payload._id,
                title: "Pro Activation Request",
                content: "Am writing for a aprovment",
                type: "PRO",
                user: user._id
            });

            if (req.body.registrationNumber) {
                user.registrationNumber = req.body.registrationNumber;
            }

            req.body.experiences.forEach(function (experience) {
                var exp = new Experiences(experience);

                exp.user_id = req.payload._id;
                exp.save(function (err) {
                    if (err) {
                        // Check if any validation errors exists (from user model)
                        res.json({
                            success: false,
                            message: "experience canot be created",
                            "Caused by ": err
                        }); // Display any other errors with validation
                    }
                });
                msg.experiences.push(exp);
                user.experiences.push(exp);

            });





            msg.save(function (err) {
                if (err) {
                    // Check if any validation errors exists (from user model)
                    res.json({
                        success: false,
                        message: "Message canot be created",
                        "Caused by ": err
                    }); // Display any other errors with validation

                }

            });

            user.messages.push(msg);







            user.save(function (err) {
                if (err) {
                    // Check if any validation errors exists (from user model)
                    res.json({
                        success: false,
                        message: "Experince canot be created",
                        "Caused by ": err
                    }); // Display any other errors with validation

                }
            });
        });
        res.status(200).json({
            success: true,
            messsage: "Experince created!"
        });
    }

};

module.exports.createExperiences = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "Private profile"
        });
    } else {
        User.findById(req.payload._id).exec(function (err, user) {
            if (req.body.text) {
                user.registrationNumber = req.body.registrationNumber;
            }
            req.body.experiences.forEach(function (experience) {
                var exp = new Experiences(experience);

                exp.user_id = req.payload._id;
                exp.save(function (err) {
                    if (err) {
                        // Check if any validation errors exists (from user model)
                        res.json({
                            success: false,
                            message: "experience canot be created",
                            "Caused by ": err
                        }); // Display any other errors with validation
                    }
                });
                user.experiences.push(exp);
            });
            user.save(function (err) {
                if (err) {
                    // Check if any validation errors exists (from user model)
                    res.json({
                        success: false,
                        message: "Experince canot be created",
                        "Caused by ": err
                    }); // Display any other errors with validation

                }
            });
        });
        res.status(200).json({
            success: true,
            messsage: "Experince created!"
        });
    }

};


module.exports.deleteExperience = function (req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            "message": "Private profile"
        });
    }
    else {
        User.findById(req.payload._id).populate('experiences').exec(function (err, user) {

            for (var i = user.experiences.length - 1; i >= 0; i--) {
                if (user.experiences[i].id == deleteExperience) {
                    user.experiences.splice(i, 1);
                    user.save(function (err, res) {
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


        var deleteExperience = req.params.id;
        Experiences.findById(deleteExperience, function (err, experiences) {
            if (err) {
                res.json({
                    success: false,
                    message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!'
                });
            }

            else {
                if (!experiences) {
                    res.json({
                        success: false,
                        message: 'No experience found with id provided '
                    }); // Return error
                }
                else {


                    if (experiences.user_id == req.payload._id) {


                        Experiences.findByIdAndRemove(deleteExperience, function (err, user) {
                            res.json({
                                success: true,
                                message: "Experience was successfully deleted"
                            }); // Return success status

                        });

                    }
                    else {
                        res.status(200).json({ message: "you dont have permission to delete others experiences" })
                    }

                }
            }
        });
    }
}



module.exports.updateOnlineStatus = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "Private profile"
        });
    } else {

        User.findById(req.payload._id, function (err, user) {

            if (err)
                res.send(err);
            user.online = req.body.online;

            if (req.body.online == "false") {
                user.logoutDate = Date.now();
            }
            // save the bear
            user.save(function (err) {
                if (err)
                    res.send(err);

                res.status(200).json(user);
            });

        });



    }

};




module.exports.getNonChatingUsers = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    } else {

        User.find({}, '_id name profilePic surname online', function (err, users) {

            if (err) console.log(err);
            else {              
                    User.findById(req.payload._id).exec(function(err,userLoggetIn){
                        if (err) console - log(err);
                        else {
                           
                            var userCount=0;
                            var userMap=[];
                            async.forEachOf(users, (OneByOneUsers, key, callback) => {
                                var counter =0;
                                async.forEachOf(userLoggetIn.userchating, (arrayOfChatingUsers, key, callback) => {     
                                   if(OneByOneUsers._id == arrayOfChatingUsers.toString()){
                                    counter++;
                                   }
                                })
                                if(counter===0){
                                    userCount++;
                                    userMap.push(OneByOneUsers);
                                }
                                   
                            })
                                    res.status(200).json({success:true,"users":userMap,"number":userCount})
                        }
                    })
                }
        });
    }
};
module.exports.chatNotifications = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    } else {

        conversationNotifications.find({"user_id":req.payload._id}).count({ "newMsg": true }, function (err, counter) {
            if(err){console.log(err)}else
            res.status(200).json({success:true,"number":counter})
        }); 
    }
};

