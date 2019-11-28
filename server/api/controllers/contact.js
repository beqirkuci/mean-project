var mongoose = require('mongoose');
var User = mongoose.model('User');
var Experiences = mongoose.model('Experiences');
var PrivateData = mongoose.model('PrivateData');


module.exports.getAllContacts = function(req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    } else {
        User.find().sort({

            name: 'desc'
        }).exec(function(err, user) {
            var userMap = [];
            user.forEach(function(elements) {
                if(elements.permission!='admin'){
                userMap.push(elements);
            }
            });
            res.status(200).json(userMap);
        });
    }

};

