const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages'); // takes in a username & message

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
  // Emits to single user connecting
  socket.emit('message', formatMessage(botName, 'Welcome to TuneIn!'));

  // Broadcast to everyone but user when user connects
  socket.broadcast.emit(
    'message',
    formatMessage(botName, 'A user has joined the chat')
  );

  // Runs when client disconnects
  socket.on('disconnect', () => {
    io.emit('message', formatMessage(botName, 'A user has left the chat'));
  });

  // Listens for chatMessage
  socket.on('chatMessage', (msg) => {
    io.emit('message', formatMessage('USER', msg));
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
