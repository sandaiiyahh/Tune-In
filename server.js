const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
let getYouTubeID = require('get-youtube-id');
// formatMessage takes in a username & message
const formatMessage = require('./utils/messages');
const {
  joinUser,
  getCurrentUser,
  removeUser,
  getRoomUsers,
} = require('./utils/users');

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
    socket.emit('message', formatMessage(botName, 'Welcome to Tune In!'));

    // Broadcast to everyone but user when user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat.`)
      );

    // Sends everyone users inside room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listens for sendTitle
  socket.on('sendTitle', (title) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit(
      'message',
      formatMessage(botName, `📺 Now Playing: ${title}`)
    );
  });

  // Listens for chatMessage
  socket.on('chatMessage', (msg) => {
    // Retrieves user info from passed in id
    // socket.id is from line 23 (the passed in socket)
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(`${user.username}`, msg));
  });

  // Listens for new video URL input
  socket.on('newVideo', (url) => {
    const user = getCurrentUser(socket.id);
    const id = getYouTubeID(url);
    io.to(user.room).emit('loadVideo', id);
  });

  // Listens for a video paused
  socket.on('videoPause', () => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('pauseVideo');
  });

  // Listens for a video played
  socket.on('videoPlay', () => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('playVideo');
  });

  // Listens for a time jump in video
  socket.on('toSeek', (time) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('seekTo', time);
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat.`)
      );
      // Sends everyone UPDATED users inside room
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
