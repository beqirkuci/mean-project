var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');

var auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});

var ctrlProfile = require('../controllers/profile');
var ctrlAuth = require('../controllers/authentication');
var ctrlUserAdmin = require('../controllers/userAdmin');
var ctrlMessagesAdmin = require('../controllers/messagesAdmin');
var ctrlProfileContact = require('../controllers/contact');
const upload = require('../controllers/upload');
const adss = require('../controllers/upload');
var crlPost = require('../controllers/postController');
var crlTimeline = require('../controllers/timelineController');
var ctrlMedia = require('../controllers/media');
var ctrlChat = require('../controllers/chat');
var ctrlComments = require('../controllers/commentController');
var ctrlExport = require('../controllers/exportController');
var ctrlNotification = require('../controllers/notificationController');
/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});



// profile
router.get('/profile/:id', auth, ctrlProfile.profileRead);
router.get('/users/:page/:perPage/:name*?', auth, ctrlUserAdmin.getAllUsers);
router.get('/users', auth, ctrlUserAdmin.getUsers);
router.put('/updateRole', auth, ctrlUserAdmin.updateUserRole);
router.put('/editUser',auth,ctrlUserAdmin.editUser);
router.delete('/deleteUser/:id', auth, ctrlUserAdmin.deleteUser);
router.put('/userExperiences', auth, ctrlUserAdmin.addUserExperiences);
router.post('/createExperiences',auth,ctrlUserAdmin.createExperiences);
router.delete('/experience/:id',auth,ctrlUserAdmin.deleteExperience);
router.get('/getNonChatingUsers',auth,ctrlUserAdmin.getNonChatingUsers);
// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);
router.put('/activate/:token', ctrlAuth.activate);
router.put('/activatePro/:id',auth,ctrlAuth.activatePro);
router.post('/invite',auth,ctrlAuth.invite);
router.put('/activateUserFromAdmin/:id',auth,ctrlAuth.adminActivateUser);
router.post('/cancelAccount',ctrlAuth.cancelAccount);
router.put('/logout/:id',auth,ctrlAuth.addDateToLogout);
//resetting passsword
router.put('/resetpassword',ctrlAuth.resetPassword);
router.get('/resetpassword/:token',ctrlAuth.resetPassswordToken);
router.put('/savepassword',ctrlAuth.savePassword);
router.put('/updateGoogleMethodFields/:id',auth,ctrlAuth.googleAddMissingFields);


 
//messages
router.get('/messages', auth, ctrlMessagesAdmin.messagesRead);
router.post('/messages', auth, ctrlMessagesAdmin.newMessage);
router.delete('/deleteMessage',auth,ctrlMessagesAdmin.deleteMessage);

//contacts
router.get('/getAllContacts',auth,ctrlProfileContact.getAllContacts);

//facebook Authorization
router.get('/auth/facebook',ctrlAuth.facebookAuth);
router.get('/auth/facebook/callback',ctrlAuth.facebookAuthCallback);

//google Authorization
router.get('/auth/google',ctrlAuth.googleAuth);
router.get('/auth/google/callback',ctrlAuth.googleAuthCallBack)

router.get('/loginredirect/:uid',ctrlAuth.loginRedirectFunction)

// upload
router.post('/upload',auth,upload);
router.post('/ads',auth,adss.apiCreate);
router.put('/adsEdit/:id',auth,adss.editAds);
router.get('/ads',auth,adss.getAllAds);
//posts
router.post('/addPost',auth,crlPost.addPost);
router.delete('/Post/:id',auth,crlPost.deletePost);
router.put('/editPost',auth,crlPost.editPost);
router.put('/like/:postId',auth,crlPost.addLike);
router.put('/disLikes/:postId',auth,crlPost.addDislike);
router.get('/allposts',auth,crlPost.getAllPosts);
router.get('/bachechaPaginate/:page/:perPage',auth,crlPost.bachechaPaginate);


router.get('/getPostsByUserId/:id/:page/:perPage',auth,crlPost.getPostsByUserId);
router.get('/images/:id',auth,crlPost.getImages);
router.get('/profPosts',auth,crlPost.professionalPosts);
router.get('/stafPosts',auth,crlPost.stafPosts);
router.get('/redazionePosts',auth,crlPost.redazionePosts);
//ban post
router.post('/ban/:id',auth,crlPost.banPost);


//notification routes

router.get('/getNotification',auth,ctrlNotification.getNotificationForPosts);
router.put('/changeNotificationStatus/:id',auth,ctrlNotification.changeNotificationStatus);
router.get('/nrOfNotification',auth,ctrlNotification.userNotifictionNumber);
router.delete('/notificationId/:id',auth,ctrlNotification.deleteNotification);
//comment
router.put('/comment/:postId',auth,ctrlComments.addComment);
router.delete('/deleteComment/:postId/:commentId',auth,ctrlComments.deleteComment);
router.put('/editComment',auth,ctrlComments.editComment);
router.put('/likeToComment/:commentId',auth,ctrlComments.addLikeToComment);
router.put('/disLikesToComment/:commentId',auth,ctrlComments.addDislikeToComment);

// api for data upgrade - used by postman
router.get('/formatComments',auth,ctrlComments.formatComments);
//timeline
router.post('/timeline',auth,crlTimeline.createTimeline);
router.put('/timeline',auth,crlTimeline.editTimeline);
router.delete('/deleteTimeline/:id',auth,crlTimeline.deleteTimeline);
router.get('/timeline/:id',auth,crlTimeline.getAllTimeline);


//private data share
router.post('/shareData/:id',auth,ctrlUserAdmin.sharePrivateData);

//addd media
router.post('/media',auth,ctrlMedia.addMedia);
router.delete('/media/:id',auth,ctrlMedia.deleteMedia);
router.get('/media/:id',auth,ctrlMedia.getmedia);

//chat
//router.get('/chat', auth, ctrlChat.getConversations);
//router.get('/getChat/:conversationId', auth, ctrlChat.getConversation);
//router.post('/reply/:conversationId', auth, ctrlChat.sendReply);
//router.post('/newChat/:recipient', auth, ctrlChat.newConversation);
router.delete('/conversationDelete/:id',auth,ctrlChat.deleteConversation);


router.get('/change',crlPost.changeMedia);

router.get('/exportMongoDb',auth,ctrlExport.exportMongoDb);

// online 
router.put('/online',auth,ctrlUserAdmin.updateOnlineStatus);

// online 
router.get('/chatNotifications',auth,ctrlUserAdmin.chatNotifications);

module.exports = router;