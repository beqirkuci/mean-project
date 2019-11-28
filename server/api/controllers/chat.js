const Conversation = require('../models/conversation'),
  Chat = require('../models/messageOfChat'),
  User = require('../models/users');

module.exports.getConversations = function (req, res, next) {

  if (!req.payload._id) {
    res.status(401).json({
      "message": "UnauthorizedError: invalid token"
    });
  }
  else {
    Conversation.find({ "participants": req.payload._id }).populate("participants").populate("chatingUser").exec((err, conversations) => {

      if (conversations.length == 0) {
        res.status(200).json({ message: "no conversation" })
      }
    else { 
           conversations.forEach((conversation) => {
            conversation.participants.forEach((participant) => {
             if(participant._id != req.payload._id){
              conversation.chatingUser = participant ;

             }
           })

          })


            return res.status(200).json({ conversations: conversations });
            
          }

          });
        }
};

module.exports.getConversation = function (req, res, next) {
  if (!req.payload._id) {
    res.status(401).json({
      "message": "UnauthorizedError: invalid token"
    });
  }
  else {
    Chat.find({ conversationId: req.params.conversationId }).select('createdAt body user').sort('-createdAt').populate({ path: 'user', select: 'name surname' }).exec((err, messages) => {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      return res.status(200).json({ "chat ": messages });
    });
  }
};

module.exports.newConversation = function (req, res, next) {
  if (!req.payload._id) {
    res.status(401).json({
      "message": "UnauthorizedError: invalid token"
    });
  } else {

    User.findById(req.params.recipient).exec(function (err, userToChat) {

      if (err) res.send(err)
      else {
        if (!userToChat) {
          res.status(200).json({ success: false, message: "user taken at parameter does not exist" })
        }
        else if (!req.body.composedMessage) {
          res.status(200).json({ success: false, message: 'Please enter a message.' });
        }
        else {
          Conversation.find({ "participants": req.payload._id }).exec(function (err, conversations) {

            if (conversations.length == 0) {
             
              const conversation = new Conversation({ participants: [req.payload._id, req.params.recipient] });
              conversation.save((err, newConversation) => {
                if (err) {
                  res.send({ error: err });
                  return next(err);
                }
                const message = new Chat({
                  conversationId: newConversation._id,
                  body: req.body.composedMessage,
                  user: req.payload._id
                });
                
                User.findById(req.payload._id).exec(function(err,user){
                    user.userchating.push(userToChat);
                    user.save(function(err){
                      if(err) console.log(err);
                    })
                    userToChat.userchating.push(user);
                    userToChat.save(function(err){})

                })

                message.save((err, newMessage) => {
                  if (err) {
                    res.send({ error: err });
                    return next(err);
                  }
                  
                  conversation.chatingUser = req.params.recipient;
                  conversation.save((err, conv) => {
                    if (err) {
                      res.send({ error: err });
                      return next(err);
                    }
                  

                  res.status(200).json({ message: 'Conversation started', conversation: conv });
                });
                });
              });

            }


            var counter = 0;
            if (conversations.length > 0) {
              conversations.forEach(function (elements) {

                if (elements.participants[0] == req.payload._id && elements.participants[1] == req.params.recipient) {
                  res.status(200).json({ message: "conversation exists, can not create a new chatroom" })
                  counter++;
                }
                else if (elements.participants[0] == req.params.recipient && elements.participants[1] == req.payload._id) {
                  res.status(200).json({ message: "conversation exists, can not create a new chatroom" })
                  counter++;
                }

              })

              if (counter == 0) {
                counter++;
                const conversation = new Conversation({ participants: [req.payload._id, req.params.recipient] });
                conversation.save((err, newConversation) => {
                  if (err) {
                    res.send({ error: err });
                    return next(err);
                  }
                  const message = new Chat({
                    conversationId: newConversation._id,
                    body: req.body.composedMessage,
                    user: req.payload._id
                  });
                  User.findById(req.payload._id).exec(function(err,user){
                    user.userchating.push(userToChat);
                    user.save(function(err){
                      if(err) console.log(err);
                    })
                    userToChat.userchating.push(user);
                    userToChat.save(function(err){})
                })

                  message.save((err, newMessage) => {
                    if (err) {
                      res.send({ error: err });
                      return next(err);
                    }
                    
                    conversation.chatingUser = req.params.recipient;
                    conversation.save((err, conv) => {
                      if (err) {
                        res.send({ error: err });
                        return next(err);
                      }
                   

                    res.status(200).json({ message: 'Conversation started', conversation: conv });
                     });
                  });
                });

              }
            }

          })

        }
      }
    })


  }
};

module.exports.sendReply = function (req, res, next) {
  if (!req.payload._id) {
    res.status(401).json({
      "message": "UnauthorizedError: invalid token"
    });
  }
  else {
    const reply = new Chat({
      conversationId: req.params.conversationId,
      body: req.body.composedMessage,
      user: req.payload._id
    });

    reply.save((err, sentReply) => {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      return res.status(200).json({ message: 'Reply successfully sent!' });
    });
  }
};

module.exports.deleteConversation = function (req, res, next) {
  if (!req.payload._id) {
    res.status(401).json({
      "message": "UnauthorizedError: invalid token"
    });
  }
  else {
          var idOfConversation = req.params.id;
    
          Chat.find({"conversationId":idOfConversation}).exec(function(err,chatToBeDeleted){
            chatToBeDeleted.forEach(function(elements){
              Chat.findByIdAndRemove(elements,function(err){
                if(err)console.log(err)
              })
              
            })
            Conversation.findByIdAndRemove(idOfConversation,function(err){
              if(err)console.log(err)
            })
          })
          res.status(200).json({success:true,message:"messagage succcesffully deleted"});
  }
};