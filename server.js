const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();

// needed to use socket:
const server = http.createServer(app);
const io = socketio(server);

// Set up static folder
app.use(express.static(path.join(__dirname, 'public')));

// Runs when client connects
io.on('connection', (socket) => {
  // Emits to single user connecting
  socket.emit('message', 'Welcome to TuneIn!');

  // Broadcast to everyone but user when user connects
  socket.broadcast.emit('message', 'A user has joined the chat');

  // Runs when client disconnects
  socket.on('disconnect', () => {
    io.emit('message', 'A user has left the chat');
  });

  // Listens for chatMessage
  socket.on('chatMessage', (msg) => {
    io.emit('message', msg);
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
