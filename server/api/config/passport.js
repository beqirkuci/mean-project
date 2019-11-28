var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var configAuth = require('./auth');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  function(username, password, done) {
    User.findOne({ email: username.trim().toLowerCase() }, function (err, user) {
      if (err) { return done(err); }
      // Return if user not found in database
      if (!user) {
        return done(null, false, {
          message: 'User not found'
        });
      }
      // Return if password is wrong
      if (!user.validPassword(password)) {
        return done(null, false, {
          message: 'Password is wrong'
        });
      }
      // If credentials are correct, return the user object
      return done(null, user);
    });
  }
));

/*passport.use(new FacebookStrategy({
  clientID: configAuth.facebookAuth.clientID,
  clientSecret: configAuth.facebookAuth.clientSecret,
  callbackURL: configAuth.facebookAuth.callbackURL,
  profileFields:['id', 'email', 'first_name', 'last_name', 'gender','picture.type(large)','address','birthday',] 
},
function(accessToken, refreshToken, profile, done) {


  console.log(profile)
  var email = profile.emails[0].value;

  User.findOne({"email":email},function(err, user){

    if(err)
      return done("errr "+err);
    if(user){
    user.uId = profile.id;
    user.save();
      return done(null, user)
    }
    else {

      var newUser = new User();
      newUser.uId = profile.id;
      newUser.temporarytoken= accessToken;
      newUser.email = email;
      newUser.active=true;
      newUser.permission='user';
      newUser.profilePic = profile.photos ? profile.photos[0].value : '/img/faces/unknown-user-pic.jpg';

      if(profile.name.givenName ==='' || profile.name.givenName==undefined){
        newUser.name='undefined'
      }
      else{
        newUser.name=profile.name.givenName
      }
      if(profile.name.familyName ==='' || profile.name.familyName==undefined){
        newUser.surname='undefined'
      }
      else{
        newUser.surname=profile.name.familyName
      }
      if(profile.gender ==='' || profile.gender==undefined){
        newUser.gender='Not Declared'
      }
      else{
        newUser.gender=profile.gender
      }
      if(profile._json.birthday ==='' || profile._json.birthday ==undefined){
        newUser.dateOfBirth=Date.now();
      }
      else{
        newUser.dateOfBirth=profile._json.birthday;
      }
      var password  = "123456";
      newUser.setPassword(password)
      newUser.save(function(err){
        if(err)
          throw err;
        return done(null, newUser);
      })
    }
  });
  
}

));


 // Google Strategy  
 passport.use(new GoogleStrategy({
  clientID: configAuth.googleAuth.clientID,
  clientSecret: configAuth.googleAuth.clientSecret,
  callbackURL: configAuth.googleAuth.callbackURL
},
function(accessToken, refreshToken,profile, done) {
 
var email = profile.emails[0].value;

      User.findOne({"email":email},function(err, user){
        
        if(err)
          return done("errr "+err);
        if(user){
          console.log("existing user "+profile)
          user.uId = profile.id;
          user.save();
            return done(null, user)
          }
        else {

          console.log("new user "+JSON.stringify(profile));

          var newUser = new User();
          newUser.uId = profile.id;
          newUser.temporarytoken= accessToken;
          newUser.email = email;
          newUser.active=true;
          newUser.permission='user';
          newUser.profilePic =profile.photos[0].value;
          

          if(profile.name.givenName ==='' || profile.name.givenName==undefined){
            newUser.name='undefined'
          }
          else{
            newUser.name=profile.name.givenName
          }
          if(profile.name.familyName ==='' || profile.name.familyName==undefined){
            newUser.surname='undefined'
          }
          else{
            newUser.surname=profile.name.familyName
          }
          if(profile.gender ==='' || profile.gender==undefined){
            newUser.gender='Not Declared'
          }
          else{
            newUser.gender=profile.gender
          }
          if(profile._json.birthday ==='' || profile._json.birthday ==undefined){
            newUser.dateOfBirth=Date.now();
          }
          else{
            newUser.dateOfBirth=profile._json.birthday;
          }
         

         
          var password  = "123456";
          newUser.setPassword(password)
          newUser.save(function(err){
            if(err)
              throw err;
            return done(null, newUser);
          })
        }
      });
    
  }

));*/
