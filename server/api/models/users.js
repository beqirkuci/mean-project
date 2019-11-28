const mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var mongoosePaginate = require('mongoose-paginate');

mongoose.plugin(schema => {
    schema.options.usePushEach = true
});
var userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    uId:{
        type:String
    },
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    telMobile: {
        type: String
    },
    telOffice: {
        type: String
    },
    email2: {
        type: String
    },
    address: {
        type: String
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    placeOfBirth: {
        type: String
    },
    maritalStatus: {
        type: String
    },
    profession: {
        type: String
    },
    permission: {
        type: String,
        required: true,
        default: 'user'
    },
    sharedMyData:{
        type: Boolean,
        default: false
    },
    isEmailPrivate:{
        type:Boolean,
        default:true
    },
    isTelPrivate:{
        type:Boolean,
        default:true
    },
    active: {
        type: Boolean,
        default: false
    },
    private: {
        type: Boolean,
        default: true
    },
    temporarytoken: {
        type: String
    },
    resettoken: {
        type: String,
        required: false
    },
    nickname: {
        type: String
    },
    placeOfResidence: {
        type: String
    },
    profilePic: {
        type: String
    },
    addressOfLiving:{
        type:String
    },
    typeOfUser:{
        type:String
    },
   
  privateDataArray:{
      type:Array
  },
  titleOfStudies:{
      type:String
  },
  registrationNumber:{
    type:String
},
  registerDate :{
    type:Date
  },
  activisationDate:{
      type:Date
  },
  loginDate:{
    type:Date
  },

  logoutDate:{
    type:Date
  },
  online: {
    type: Boolean,
    default: false
    },
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'Messages'
    }],

    experiences: [{
        type: Schema.Types.ObjectId,
        ref: 'Experiences'
    }],
    privateData: {
        type: Schema.Types.ObjectId,
        ref: 'PrivateData'
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Posts'
    }],
    userchating: [{ 
        type: Schema.Types.ObjectId, ref: 'User' 
    }],

    profilePic: {
        type: String
    },
    resetNotification:{
        type:Boolean,
        default:false
    },
    numberOfNotification:{
        type:String
    },
    hash: String,
    salt: String,

});

userSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

userSchema.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
};

userSchema.methods.generateJwt = function () {

    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    return jwt.sign({
        _id: this._id,
        email: this.email,
        name: this.name,
        exp: parseInt(expiry.getTime() / 1000),
    }, "MY_SECRET"); // DO NOT KEEP YOUR SECRET IN THE CODE!
};
userSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', userSchema);