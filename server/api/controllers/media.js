var mongoose = require('mongoose');
var Medias = mongoose.model('Medias');
var User = mongoose.model('User');

module.exports.addMedia = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    } {
        User.findById(req.payload._id).exec(function (err, user) {
            if(req.body.image){
            var media = new Medias();

            media.user_id = req.payload._id;
            media.image = req.body.image;


            media.save(function (err) {
                if (err) {
                    // Check if any validation errors exists (from user model)
                    res.json({
                        success: false,
                        message: "image canot be created",
                        "Caused by ": err
                    }); // Display any other errors with validation

                } else {
                    res.status(200);
                    res.json({
                        success: true,
                        messsage: "Image created!",
                        "media":media
                        
                    });
                }
            });
        }
        else{
            res.status(200).json({success:false, message:"You have to choose a photo first"})
        }
        })
    }
}


module.exports.deleteMedia = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "Private profile"
        });
    }
    else {
        var deleteMedia = req.params.id;
        Medias.findById(deleteMedia, function (err, media) {
            if (err) {
                res.json({
                    success: false,
                    message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!'
                });
            }

            else {
                if (!media) {
                    res.json({
                        success: false,
                        message: 'No image found with id provided '
                    }); // Return error
                }
                else {
                    if (media.user_id == req.payload._id) {
                        Medias.findByIdAndRemove(media, function (err, user) {
                            res.json({
                                success: true,
                                message: "image was successfully deleted"
                            }); // Return success status

                        });
                    }
                    else {
                        res.status(200).json({ message: "you dont have permission to delete others images" })
                    }

                }
            }
        });
    }
}
module.exports.getmedia = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "Private profile"
        });
    }
    else {

        var idofProfile = req.params.id;
        Medias.find({"user_id":idofProfile}).sort({ time: 'desc' }).exec(function (err, media) {
            var mediaMap = [];
            if (err) console.log(err)
            if (media.length==0) res.status(200).json({ success: false, message: "no media found" })

            else{
            media.forEach(function (elements) {
         
                    mediaMap.push(elements);
 
            });
            res.status(200).json({ success: true, mediaMap });
        }
        });

    }
}