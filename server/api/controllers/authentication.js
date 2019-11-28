var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Notification = mongoose.model('Notification');
var nodemailer = require('nodemailer'); // Import Nodemailer Package
var jwt = require('jsonwebtoken');

var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

var client = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'registrazione.Project-name@gmail.com', // Your email address
        pass: 'Project-name2018' // Your password
    },
    tls: { rejectUnauthorized: false }
});

module.exports.invite = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "Private profile"
        });
    }
    else {


        var email = {
            from: 'Project-name Staff',
            to: [req.body.email],
            subject: 'Invito di registrazione',
            text: 'Ciao  ' + req.body.email,
            html: 'Ciao<strong> ' + req.body.email + '</strong>,<br><br> Sei stato invitato da ' + req.payload.name + ' a registrarti su www.Project-name.it <br><br>Vai su <a href="http://www.Project-name.it/signup"> http://www.Project-name.it/signup </a> <br><br> Ti aspettiamo!'
        };

        client.sendMail(email, function (err, info) {
            if (err) {
                console.log(err); // If error with sending e-mail, log to console/terminal
            } else {
                console.log(info); // Log success message to console if sent
                console.log(req.body.email); // Display e-mail that it was sent to
            }
        });
        res.status(200).json({ success: true, message: 'email sent successfully to ' + req.body.email });

    }
}
module.exports.register = function (req, res) {

    var user = new User();

    user.name = req.body.name;
    user.email = req.body.email.trim().toLowerCase();
    user.surname = req.body.surname;
    user.gender = req.body.gender;
    user.dateOfBirth = req.body.dateOfBirth;
    user.image = req.body.image;
    user.registerDate =  Date.now();

    user.setPassword(req.body.password);

    User.find({ "email": req.body.email.trim().toLowerCase() }, function (err, utente) {
        console.log("hekkjbkb" + utente);
        if (utente.length > 0) {
            res.status(200);
            res.json({ success: false, message: 'This user with this email already Exist' });
        } else if
        // Check if request is valid and not empty or null
        (req.body.name === null || req.body.email === null || req.body.surname === null || req.body.gender === null || req.body.dateOfBirth === null) {
            res.json({ success: false, message: 'Ensure all fields are filled' });
        } else {
            // Save new user to database
            user.save(function (err) {
                user.temporarytoken = user.generateJwt(); // Create a token for activating account through e-mail
                user.save(function (err) {
                    if (err) {
                        res.json({ success: false, "Caused by ": err }); // Display any other errors with validation

                    }
                })
                if (err) {
                    // Check if any validation errors exists (from user model)
                    res.json({ success: false, message: "User with email " + user.email + " alredy exist", "Caused by ": err }); // Display any other errors with validation

                } else {

                    var email = {
                        from: 'Project-name Staff',
                        to: [user.email, 'User'],
                        subject: 'Link attivazione utenza Project-name.it',
                        text: 'Ciao ' + user.name + ', Grazie per esserti registrato su www.Project-name.it. Perfavore clicca sul link sotto riportato per completare la tua attivazione: http://www.Project-name.it/activate?' + user.temporarytoken,
                        html: 'Ciao<strong> ' + user.name + '</strong>,<br><br>Grazie per esserti registrato su www.Project-name.it. Perfavore clicca sul link sotto riportato per completare la tua attivazione:<br><br><a href="http://www.Project-name.it/activate?' + user.temporarytoken + '">http://www.Project-name.it/activate/</a>'
                    };

                    client.sendMail(email, function (err, info) {
                        if (err) {
                            console.log(err); // If error with sending e-mail, log to console/terminal
                        } else {
                            console.log(info); // Log success message to console if sent
                            console.log(user.email); // Display e-mail that it was sent to
                        }
                    });
                    res.status(200);
                    res.json({ success: true, message: 'Account registered! Please check your e-mail for activation link.' });
                }
            });

        }

    });

};


module.exports.adminActivateUser = function (req,res){
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: invalid token"
        });
    }
    else{
        User.findByIdAndUpdate(req.params.id).exec(function (err, user){
            if(err)
            {
                res.status(200).json({success:false,message:"id is typed wrong", "error":err})
            }
            else{

                 if(!user){
                             res.status(200).json({success:false,message:"this user does not exist"})
                 }
                 else{
                            if(user.active){
                                    res.status(200).json({success:false,message:"user is already activated"})
                            }
                            else{

                                    user.active=true;
                                    user.temporarytoken = false;
                                    

                                    var email = {
                                        from: 'Project-name Staff, registrazione.Project-name@gmail.com',
                                        to: user.email,
                                        subject: 'Account è stato attivato',
                                        text: 'Ciao ' + user.name + ', Il tuo account è stato attivato con successo dallo staff di Project-name!',
                                        html: 'Ciao<strong> ' + user.name + '</strong>,<br><br>Il tuo account è stato attivato con successo dallo staff di Project-name!!'
                                    };
                                    // Send e-mail object to user
                                    client.sendMail(email, function (err, info) {
                                        if (err) console.log(err); // If unable to send e-mail, log error info to console/terminal
                                    });
                                    
                                    
                                    user.save(function (err) {
                                        if (err) {
                                            res.json({
                                                success: false,
                                                message: "User activation failed",
                                                "Caused by ": err
                                            });
                                        }
                                        else {
                                            res.status(200).json({
                                                success: true,
                                                messsage: "user is activated"
                                                
                                            });
                                        }

                                    })
                        }

            }
        }
        })

        
    }
}
// Route to activate the user's account 
module.exports.activate = function (req, res) {
    User.findOne({ temporarytoken: req.params.token }, function (err, user) {
        if (err) {
            console.log(err);
            client.sendMail(email, function (err, info) {
                if (err) {
                    console.log(err); // If error with sending e-mail, log to console/terminal
                } else {
                    console.log(info); // Log success message to console if sent
                    console.log(user.email); // Display e-mail that it was sent to
                }
            });
            res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
        } else {
            var token = req.params.token; // Save the token from URL for verification 
            // Function to verify the user's token
            jwt.verify(token, "MY_SECRET", function (err, decoded) {
                if (err) {
                    res.json({ success: false, message: 'Activation link has expired.' }); // Token is expired
                } else if (!user) {
                    res.json({ success: false, message: 'Activation link has expired.' }); // Token may be valid but does not match any user in the database
                } else {
                    user.temporarytoken = false; // Remove temporary token
                    user.active = true; // Change account status to Activated
                    user.activisationDate = Date.now();
                    // Mongoose Method to save user into the database
                    user.save(function (err) {
                        if (err) {
                            console.log(err); // If unable to save user, log error info to console/terminal
                        } else {
                            // If save succeeds, create e-mail object
                            var email = {
                                from: 'Project-name Staff, registrazione.Project-name@gmail.com',
                                to: user.email,
                                subject: 'Account è stato attivato',
                                text: 'Ciao ' + user.name + ', Il tuo account è stato attivato con successo!',
                                html: 'Ciao<strong> ' + user.name + '</strong>,<br><br>Il tuo account è stato attivato con successo!!'
                            };
                            // Send e-mail object to user
                            client.sendMail(email, function (err, info) {
                                if (err) console.log(err); // If unable to send e-mail, log error info to console/terminal
                            });
                            res.json({ success: true, message: 'Account activated!', "token": token, "user": user }); // Return success message to controller
                        }
                    });
                }
            });
        }
    });
};


module.exports.activatePro = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    }
    else {
        var userUpdate = req.params.id;
        User.findById(userUpdate, function (err, user) {

            if (user.permission === 'user') {
                user.permission = 'professional';
                user.save(function (err) {
                    if (err) {
                        // Check if any validation errors exists (from user model)
                        res.json({
                            success: false,
                            message: "user canot be updated",
                            "Caused by ": err
                        }); // Display any other errors with validation

                    } else {
                        var email = {
                            from: 'Project-name Staff, registrazione.Project-name@gmail.com',
                            to: [user.email],
                            subject: 'Pro activization',
                            text: 'Hello ' + user.email,
                            html: 'Hello<strong> ' + user.email + '</strong>,<br><br> you are now as professional'
                        };

                        client.sendMail(email, function (err, info) {
                            if (err) {
                                console.log(err); // If error with sending e-mail, log to console/terminal
                            } else {
                                console.log(info); // Log success message to console if sent
                                console.log(user.email); // Display e-mail that it was sent to
                            }
                        });
                        res.status(200);
                        res.json({
                            success: true,
                            messsage: "User permission successfully updated!"
                        });

                    }
                });
            }
            else {
                res.status(200).json({ success: false, message: "This user is already a professsional!" })
            }
        })
    }
}


module.exports.login = function (req, res) {


    passport.authenticate('local', function (err, user, info) {
        var token;

        // If Passport throws/catches an error
        if (err) {
            res.status(404).json(err);
            return;
        }



        // If a user is found
        if (user && user.active) {

            user.loginDate = Date.now();
            token = user.generateJwt();
            res.status(200);







          

            if(user.resetNotification){
                user.numberOfNotification =0;

                res.json({
                    "token": token, "success": true, "messsage": "Login completed!", active: true,
                    "name": user.name,
                    "surname": user.surname,
                    "email": user.email,
                    "userId": user._id,
                    "role": user.permission,
                    "gender": user.gender,
                    "profilePic":user.profilePic,
                    "numberOfNotification": user.numberOfNotification
    
    
                });
               
              }
              else{
                  console.log("elseeee");
                  Notification.count({ "targetUser": user._id , "active":true}, function (err, c) {
                    if(err)console.log(err)
                    else{
                        user.numberOfNotification =c;
                     


                        res.json({
                            "token": token, "success": true, "messsage": "Login completed!", active: true,
                            "name": user.name,
                            "surname": user.surname,
                            "email": user.email,
                            "userId": user._id,
                            "role": user.permission,
                            "gender": user.gender,
                            "profilePic":user.profilePic,
                            "numberOfNotification": user.numberOfNotification
            
            
                        });
                  }
                  })
          
                }


           
         
           
            user.save();
        }
        else if (user && !user.active) {
            //is user is not activated!
            res.status(200);
            res.json({ success: false, messsage: "User not activated!", active: false });
        }
        else {
            // If user is not found
            res.status(200);
            res.json({ success: false, message:info.message});
        }
    })(req, res);

};



module.exports.resetPassword = function (req, res) {
    console.log(req.body.email);
    User.findOne({ "email": req.body.email }).exec(function (err, user) {
        if (err) {
            console.log(err);
            // Function to send e-mail to myself
            client.sendMail(email, function (err, info) {
                if (err) {
                    console.log(err); // If error with sending e-mail, log to console/terminal
                } else {
                    console.log(info); // Log success message to console if sent
                    console.log(user.email); // Display e-mail that it was sent to
                }
            });
            res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
        } else {

            if (!user) {
                res.json({ success: false, message: 'Email was not found' }); // Return error if username is not found in database
            } else if (!user.active) {
                res.json({ success: false, message: 'Account has not yet been activated' }); // Return error if account is not yet activated
            } else {
                user.resettoken = user.generateJwt(); // Create a token for activating account through e-mail
                // Save token to user in database
                user.save(function (err) {
                    if (err) {
                        res.json({ success: false, message: err }); // Return error if cannot connect
                    } else {
                        // Create e-mail object to send to user
                        var email = {
                            from: 'Project-name Staff, test-Project-name@gmail.com',
                            to: user.email,
                            subject: 'Reset Password Request',
                            text: 'Hello ' + user.name + ', You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="http://www.Project-name.it/recover?' + user.resettoken,
                            html: 'Hello<strong> ' + user.name + '</strong>,<br><br>You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="http://www.Project-name.it/recover?' + user.resettoken + '">http://www.Project-name.it/recover/</a>'
                        };
                        // Function to send e-mail to the user
                        client.sendMail(email, function (err, info) {
                            if (err) {
                                console.log(err); // If error with sending e-mail, log to console/terminal
                            } else {
                                console.log(info); // Log success message to console
                                console.log('sent to: ' + user.email); // Log e-mail 
                            }
                        });
                        res.json({ success: true, message: 'Please check your e-mail for password reset link', "temporarytoken": user.resettoken }); // Return success message
                    }
                });
            }
        }
    });

}



// Route to verify user's e-mail activation link
module.exports.resetPassswordToken = function (req, res) {
    User.findOne({ resettoken: req.params.token }).select().exec(function (err, user) {
        if (err) {
            // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
            console.log('An error occured');
            // Function to send e-mail to myself
            client.sendMail(email, function (err, info) {
                if (err) {
                    console.log(err); // If error with sending e-mail, log to console/terminal
                } else {
                    console.log(info); // Log success message to console if sent
                    console.log(user.email); // Display e-mail that it was sent to
                }
            });
            res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
        } else {
            var token = req.params.token; // Save user's token from parameters to variable
            // Function to verify token
            jwt.verify(token, "MY_SECRET", function (err, decoded) {
                if (err) {
                    res.json({ success: false, message: 'Password link has expired' }); // Token has expired or is invalid
                } else {
                    if (!user) {
                        res.json({ success: false, message: 'Password link has expired' }); // Token is valid but not no user has that token anymore
                    } else {
                        res.json({ success: true, user: user }); // Return user object to controller
                    }
                }
            });
        }
    });

}




// Save user's new password to database
module.exports.savePassword = function (req, res) {
    User.findOne({ email: req.body.email }).select('username email name password resettoken').exec(function (err, user) {
        if (err) {

            console.log('some error occur' + err);
            // Function to send e-mail to myself
            client.sendMail(email, function (err, info) {
                if (err) {
                    console.log(err); // If error with sending e-mail, log to console/terminal
                } else {
                    console.log(info); // Log success message to console if sent
                    console.log(user.email); // Display e-mail that it was sent to
                }
            });
            res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
        } else {
            if (req.body.password === null || req.body.password === '' || user==null) {
                res.json({ success: false, message: 'Password not provided' });
            } else {
                user.setPassword(req.body.password); // Save user's new password to the user object
                user.resettoken = false; // Clear user's resettoken 
                // Save user's new data
                user.save(function (err) {
                    if (err) {
                        res.json({ success: false, message: err });
                    } else {
                        // Create e-mail object to send to user
                        var email = {
                            from: 'Project-name staff, registrazione.Project-name@gmail.com',
                            to: user.email,
                            subject: 'Password Recently Reset',
                            text: 'Hello ' + user.name + ', This e-mail is to notify you that your password was recently reset at www.Project-name.it',
                            html: 'Hello<strong> ' + user.name + '</strong>,<br><br>This e-mail is to notify you that your password was recently reset at www.Project-name.it'
                        };
                        // Function to send e-mail to the user
                        client.sendMail(email, function (err, info) {
                            if (err) console.log(err); // If error with sending e-mail, log to console/terminal
                        });
                        res.json({ success: true, message: 'Password has been reset!' }); // Return success message
                    }
                });
            }
        }
    });

};
module.exports.cancelAccount = function(req,res){
    
    if( req.body.email ){
                var email = {
                    from: 'registrazione.Project-name@gmail.com',
                    to: 'info@Project-name.it',
                    subject: 'Cancellare il mio account',
                    text: 'Ciao  ' + 'info@Project-name.it',
                    html: 'Ciao<strong> ' + 'info@Project-name.it' + '</strong>,<br><br> Persona con email '+req.body.email+' vuole disattivare il suo account. <br> <br> grazie!'
                };
                console.log(req.body.email)

                client.sendMail(email, function (err, info) {
                    if (err) {
                        res.status(500).json({message:"email could not be sent", "error":err}) // If error with sending e-mail, log to console/terminal
                    } else {
                        res.status(200).json({ success: true, message: 'email sent successfully to '+'info@Project-name.it' });
                    }
                });
}
    else{
        res.status(200).json({message:"input email is empty"})
}

}

module.exports.addDateToLogout = function(req,res){
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    }
    else{
        var id = req.params.id;
        User.findById(id).exec(function(err,user){
            if(err) res.send(err)
            else{
                user.logoutDate =Date.now();
                
                user.save(function (err) {
                    if (err) {
                        // Check if any validation errors exists (from user model)
                        res.json({
                            success: false,
                            message: "post canot be created",
                            "Caused by ": err
                        }); // Display any other errors with validation
    
                    } else {
                        res.status(200);
                        res.json({
                            success: true,
                            messsage: "Date added to logout person"
                           
                        });
                    }
                });

            }
        })
    }
}


module.exports.facebookAuth = passport.authenticate('facebook', { scope:  ['public_profile', 'email'] });
module.exports.facebookAuthCallback  = function(req,res){

    passport.authenticate('facebook', function (err, user, info) {
        var token;

        // If Passport throws/catches an error
        if (err) {
            res.status(404).json(err);
            return;
        }


        // If a user is found
        if (user && user.active) {
            user.temporarytoken=false;
            user.loginDate = Date.now();
            token = user.generateJwt();
            res.redirect('http://Project-name.com/loginredirect?facebook=' + user.uId);
        
            user.save();
        }
        else if (user && !user.active) {
            //is user is not activated!
            res.status(200);
            res.json({ success: false, messsage: "User not activated!", active: false });
        }
        else {
            // If user is not found
            res.status(200);
            res.json({ success: false, message:info.message});
        }
    })(req, res);
}


module.exports.googleAuth = passport.authenticate('google', { scope:
    [ 'https://www.googleapis.com/auth/plus.login',
      'https://www.googleapis.com/auth/plus.profile.emails.read' ] }
);

module.exports.googleAuthCallBack = function(req,res){

    passport.authenticate('google', function (err, user, info) {
        var token;

        // If Passport throws/catches an error
        if (err) {
            res.status(404).json(err);
            return;
        }


        // If a user is found
        if (user && user.active) {
            user.temporarytoken=false;
            user.loginDate = Date.now();
            token = user.generateJwt();
            res.redirect('http://Project-name.com/loginredirect?google=' + user.uId);
            user.save();
        }
        else if (user && !user.active) {
            //is user is not activated!
            res.status(200);
            res.json({ success: false, messsage: "User not activated!", active: false });
        }
        else {
            // If user is not found
            res.status(200);
            res.json({ success: false, message:info.message});
        }
    })(req, res);
}

module.exports.googleAddMissingFields = function(req,res){
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    }
    else{
        User.findById(req.params.id).exec(function(err,user){
            if(err)console.log(err)
            else{
            
                user.setPassword(req.body.password);
                user.save(function(err){
                    if(err)
                    console.log(err)
                })
            }
        })
    }
}

module.exports.loginRedirectFunction = function(req,res){
    
    
        User.find({"uId":req.params.uid}).exec(function(err,users){
            if(users.length > 0){
           var user = users[0];
            if(err)console.log(err)
            else{
                // If a user is found      
            user.loginDate = Date.now();
            token = user.generateJwt();
            if(user.resetNotification){
                user.numberOfNotification =0;

                res.json({
                    "token": token, "success": true, "messsage": "Login completed!", active: true,
                    "name": user.name,
                    "surname": user.surname,
                    "email": user.email,
                    "userId": user._id,
                    "role": user.permission,
                    "gender": user.gender,
                    "profilePic":user.profilePic,
                    "numberOfNotification": user.numberOfNotification,
                    "uid": user.uId
    
    
                });
               
              }
              else{
                  Notification.count({ "targetUser": user._id , "active":true}, function (err, c) {
                    if(err)console.log(err)
                    else{
                        user.numberOfNotification =c;
                        res.json({
                            "token": token, "success": true, "messsage": "Login completed!", active: true,
                            "name": user.name,
                            "surname": user.surname,
                            "email": user.email,
                            "userId": user._id,
                            "role": user.permission,
                            "gender": user.gender,
                            "profilePic":user.profilePic,
                            "numberOfNotification": user.numberOfNotification,
                            "uid": user.uId
        
                        });
                       }
                  })
          
                }
                user.save(function(err){
                    if(err)
                    console.log(err)
                })
            }
          } else {
            res.status(200);
            res.json({ success: false, message:"User not found"});

          }
        })
    
}