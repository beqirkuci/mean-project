var mongoose = require('mongoose');
var Messages = require('../models/messages')
var User = mongoose.model('User');

module.exports.messagesRead = function(req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: invalid token"
        });
    } else {
        Messages.find().sort({

            time: 'desc'
        }).populate('user').populate('experiences').populate('post').exec(function(err, messages) {
            var messagesMap = [];
            messages.forEach(function(messages) {

                messagesMap.push(messages);
            });
            res.status(200).json(messagesMap);
        });
    }

};
module.exports.newMessage = function(req, res) {

    // if(!req.body.name || !req.body.email || !req.body.password) {
    //   sendJSONresponse(res, 400, {
    //     "message": "All fields required"
    //   });
    //   return;
    // }
    // get logged user properties and set it to messages entity 
    var messages = new Messages();

    messages.user_id = req.body.user_id;
    messages.title = req.body.title;
    messages.content = req.body.content;
    messages.decription = req.body.decription;
    messages.type = req.body.type;

    User.findById(req.body.user_id, function(err, utente) {
        console.log(utente);
        var msg = new Messages({
            user_id: messages.user_id,
            title: messages.title,
            content: messages.content,
            decription: messages.decription,
            type: messages.type,
            user: utente._id
        });




        // Check if request is valid and not empty or null
        if (req.body.user_id === null || req.body.title === null || req.body.content === null || req.body.decription === null || req.body.type === null) {
            res.json({
                success: false,
                message: 'Ensure all fields are filled'
            });
        } else {
            // Save new user to database
            msg.save(function(err) {
                if (err) {
                    // Check if any validation errors exists (from user model)
                    res.json({
                        success: false,
                        message: "Message canot be created",
                        "Caused by ": err
                    }); // Display any other errors with validation

                } else {
                    res.status(200);
                    res.json({
                        success: true,
                        messsage: "Message created!"
                    });
                }
            });
        }
    });

};

module.exports.deleteMessage = function(req, res) {
    var deletedMessage = req.body._id; // Assign the username from request parameters to a variable
    Messages.findById(deletedMessage, function(err, Msgs) {
        if (err) {
            console.log(err);
            res.json({
                success: false,
                message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!'
            });
        } else {
            // Check if current user was found in database
            if (!Msgs) {
                res.json({
                    success: false,
                    message: 'No message with id provided was found'
                }); // Return error
            } else {
                // Fine the user that needs to be deleted
                Messages.findByIdAndRemove(deletedMessage, function(err, user) {
                    if (err) {
                        res.json({
                            success: false,
                            message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!'
                        });
                    } else {
                        res.json({
                            success: true,
                            message: "Message was successfully deleted"
                        }); // Return success status
                    }
                });
            }
        }
    });
};

