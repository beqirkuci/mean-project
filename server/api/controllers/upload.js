var mongoose = require('mongoose');
const Ads = require('../models/ads.js');
const IncomingForm = require('formidable').IncomingForm;
var fs = require('fs');
var User = mongoose.model('User');




module.exports = function upload(req, res) {
  var form = new IncomingForm();


  form.on('file', (field, file) => {
    var oldpath = file.path;

    var date=Date.now();
    var newpath = '/home/' + date +"_"+file.name.replace(/[^A-Z0-9-.]+/ig, "_");
    fs.rename(oldpath, newpath, function (err) {
      if (err) throw err;
      
      res.json({ success: true, message: 'File uploaded and moved!', "path": ""});
      res.end();
    });
  });
  form.parse(req);
};

module.exports.apiCreate = function (req, res) {

  if (!req.payload._id) {
    res.status(401).json({
      "message": "UnauthorizedError: private profile"
    });
  }
  else {

    var ads = new Ads();
    ads.user_id=req.payload._id;
    ads.adsid = req.body.adsid;
    ads.path = req.body.path;
    ads.id = req.body.id;
    ads.url = req.body.url;

    ads.save(function (err) {
        if (err) {
          res.json({
            success: false,
            message: "Message canot be created",
            "Caused by ": err
          });
        }
        else {
          res.status(200).json({
            success: true,
            messsage: "ads created!"
          });
        }

    })
  }


}

module.exports.getAllAds = function(req,res){
  if (!req.payload._id) {
    res.status(401).json({
        "message": "Private profile"
    });
}
else{
  Ads.find().sort({createdAt:'desc'}).exec(function(err,ads){
    var adsMap = [];
    ads.forEach(function(ads) {

      adsMap.push(ads);
  });
  res.status(200).json({adsMap,success:true});
  })
}
}



module.exports.editAds = function (req, res) {
  if (!req.payload._id) {
      res.status(401).json({
          "message": "Private profile"
      });
  } else {
      Ads.findById(req.params.id, function (err, ads) {
          if (err)
              res.send(err);
          else {
              if (!ads) {
                  res.json({
                      success: false,
                      message: 'No ads found with id provided '
                  }); // Return error
              } else {

               if(req.payload._id){
                 

                    ads.adsid = req.body.adsid;
                    ads.path = req.body.path;
                    ads.id = req.body.id;
                    ads.url = req.body.url;

                    ads.save(function (err) {
                          if (err)
                              res.send(err);

                          res.status(200).json({
                              success: true,
                              message: "ads successfully updated",
                              "ads": ads
                          });
                      });
                    }
                  else {
                      res.json({ message: "You can not edit others ads" });
                  }
              }

          }
      });

  }

};