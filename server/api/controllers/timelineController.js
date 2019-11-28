var mongoose = require('mongoose');
var User = mongoose.model('User');
var Timeline = mongoose.model('Timeline');
var Medias = mongoose.model('Medias');

module.exports.createTimeline = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    }
    else {
        User.findById(req.payload._id).exec(function (err, user) {


            var timeline = new Timeline();

            timeline.user_id = req.payload._id;
            
            timeline.name = user.name;
            timeline.time = req.body.time;
            timeline.surname = user.surname;
            timeline.content = req.body.content;
            timeline.title = req.body.title;

            if(req.body.image){
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
                timeline.images=img;
              

        }
            timeline.save(function (err) {
                if (err) {
                    // Check if any validation errors exists (from user model)
                    res.json({
                        success: false,
                        message: "timeline canot be created",
                        "Caused by ": err
                    }); // Display any other errors with validation

                } else {
                    if(req.body.image){
                    Medias.findById(timeline.images._id,function(err, images){

                        images.timeline_id = timeline._id;

                     images.save(function(err){
                         if(err)console.log(err)
                     });
                     })
                    }

                    res.status(200);
                    res.json({
                        success: true,
                        messsage: "timeline created!"
                    });
                }
            });

        });

    }
}

module.exports.editTimeline = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "Private profile"
        });
    } else {
        Timeline.findById(req.body._id, function (err, timeline) {
            if (err)
                res.send(err);
            else {
                if (!timeline) {
                    res.json({
                        success: false,
                        message: 'No timeline  found with id provided '
                    }); // Return error
                } else {



                    if (timeline.user_id == req.payload._id) {

                        timeline.content = req.body.content;
                        timeline.title = req.body.title;

                        if(req.body.image){
                            var img = new Medias();
                            img.user_id = req.payload._id;
                            img.image = req.body.image;
                            img.timeline_id = timeline._id;
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
                            timeline.images=img;
                        }

                        timeline.save(function (err) {
                            if (err)
                                res.send(err);

                            res.status(200).json({
                                success: true,
                                message: "timeline successfully updated",
                                "timeline": timeline
                            });
                        });
                    }
                    else {
                        res.json({ message: "You can not edit others timeline" });
                    }
                }

            }
        });

    }

}

module.exports.deleteTimeline = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "Private profile"
        });
    }
    else {
        var deleteTimeline = req.params.id;
        Timeline.findById(deleteTimeline, function (err, timeline) {
            if (err) {
                res.json({
                    success: false,
                    message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!'
                });
            }

            else {
                if (!timeline) {
                    res.json({
                        success: false,
                        message: 'No timeline found with id provided '
                    }); // Return error
                }
                else {
                    if (timeline.user_id == req.payload._id) {
                        Medias.find({'timeline_id':deleteTimeline}).exec(function(err,media){                       
                            Medias.findByIdAndRemove(media,function(err){
                                if(err)res.send(err)
                            });

                   })
                        Timeline.findByIdAndRemove(deleteTimeline, function (err, user) {
                            res.json({
                                success: true,
                                message: "timeline was successfully deleted"
                            }); // Return success status

                        });
                    }
                    else {
                        res.status(200).json({ message: "you dont have permission to delete others timeline" })
                    }

                }
            }
        });
    }
}

module.exports.getAllTimeline = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
    } else {

        Timeline.find({ "user_id": req.params.id }).sort({ time: 'desc' }).populate('images').exec(function (err, timeline) {

            if (timeline.length == 0) {
                res.status(200).json({ success: true, message: "you dont have timeline" });
            }

            else {
                var timelineMap = [];
                timeline.forEach(function (elements) {


                    timelineMap.push(elements);

                });
                res.status(200).json({ success: true, timelineMap });
            }
        });



    }
}


