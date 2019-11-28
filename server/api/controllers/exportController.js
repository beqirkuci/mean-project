var mongoose = require('mongoose');
var User = mongoose.model('User');
csv = require('express-csv')

module.exports.exportMongoDb = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "Private profile"
        });
    }
    else {
        var user = req.payload._id;
       
        User.findById(user).exec(function (err, user) {
            if (user.permission === 'admin') {

               
                User.find({},'name surname gender email permission active dateOfBirth profession telMobile nickname placeOfResidence addressOfLiving titleOfStudies profilePic registerDate activisationDate loginDate logoutDate').lean().exec({}, function (err, users) {
                    if (err) res.send(err);
                    
                    
                    res.status(200).json({"data":users});
                });

            }
			else{
                res.status(200).json({success:false, message:"no access to generate csv"});
            }
        })
    }
}



