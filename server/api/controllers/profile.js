var mongoose = require('mongoose');
var User = mongoose.model('User');
var Notification = mongoose.model('Notification');

module.exports.profileRead = function (req, res) {

  if (!req.payload._id) {
    res.status(401).json({
      "message": "UnauthorizedError: private profile"
    });
  } else {


    var counter = 0;
    User.find(function (err, users) {
      users.forEach(function (elements) {
        if (elements.permission === 'admin')
          counter++;
      })
    })

    //verify if i shared my data with that user
    var share = false;
    User.findById(req.payload._id).exec(function (err, utente) {
      if (utente && utente.privateDataArray.length > 0) {
        utente.privateDataArray.forEach(function (element) {
          if (element == req.params.id) {
            share = true;

          }

        })
      }

    });


    User.findById(req.params.id)
      .populate('privateData').populate('experiences').sort({ createdAt: 'desc' }).exec(function (err, user) {
        if (err) {
          res.status(200).json({ "Caused by ": err });
        } else
          user = user.toObject();
        if (user.permission === 'user') {
          delete user.registrationNumber;
          delete user.experiences;
        }
        delete user.hash;
        delete user.salt;
        delete user.temporarytoken;
        delete user.messages;

        // if user is in own profile or not
        if (req.payload._id == req.params.id) {
          user.contact = false;
        } else { //  user is on othe profile
          user.contact = true;
          if (user && user.privateDataArray.length > 0) {
            user.privateDataArray.forEach(function (element) {
              // if user has shared data with me then i can see private data
              if (element == req.payload._id) {
                user.private = false;
              }



            })
          }



        }
    if(user.resetNotification){
      user.numberOfNotification =0;


      user.sharedMyData = share;
      User.count({}, function (err, c) {
        console.log('ssssss')
        res.status(200).json({ user, "nr of users total ": c - counter });

      });

    }
    else{
          

        Notification.count({ "targetUser": user._id , "active":true}, function (err, c) {
          if(err)console.log(err)
          else{
          user.numberOfNotification =c;


          user.sharedMyData = share;
          User.count({}, function (err, c) {
            res.status(200).json({ user, "nr of users total ": c - counter });
  
          });
  
            
        }
        })

      }

    



      });






  }





};

