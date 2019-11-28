exports=module.exports = function (socked) {
    // Set socket.io listeners.
    socked.on('connection', (socket) => {

       console.log("a user connected");
  
      // On conversation entry, join broadcast channel
      socket.on('enter conversation', (conversation) => {
        socket.join(conversation);
        console.log('joined ' + conversation);
      });
  
      socket.on('leave conversation', (conversation) => {
        socket.leave(conversation);
         console.log('left ' + conversation);
      });
  
      socket.on('new message', (conversation) => {
        socked.sockets.in(conversation).emit('refresh messages', conversation);
      });
  
      socket.on('disconnect', () => {
         console.log('user disconnected');
      });
    });
  };
  