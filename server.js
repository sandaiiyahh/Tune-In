const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
// formatMessage takes in a username & message
const formatMessage = require('./utils/messages');
// Two user related functions
const { joinUser, getCurrentUser } = require('./utils/users');

const app = express();

// needed to use socket:
const server = http.createServer(app);
const io = socketio(server);

// Set up static folder
app.use(express.static(path.join(__dirname, 'public')));

// Set variable for bot
const botName = 'Cody Bot';

// Runs when client connects
io.on('connection', (socket) => {
  // Destructure username and room from passed in object
  socket.on('joinRoom', ({ username, room }) => {
    // Return user from joinUser func. socket.id comes from line 23 (passed in socket)
    const user = joinUser(socket.id, username, room);

    // Socket has a built in join method that allows emitting to a specific room (ex.broadcast.to())
    socket.join(user.room);

    // Emits to single user connecting
    socket.emit('message', formatMessage(botName, 'Welcome to TuneIn!'));

    // Broadcast to everyone but user when user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );
  });

  // Listens for chatMessage
  socket.on('chatMessage', (msg) => {
    // Retrieves user info from passed in id
    // socket.id is from line 23 (the passed in socket)
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(`${user.username}`, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    io.emit('message', formatMessage(botName, 'A user has left the chat'));
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
