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
  console.log('New WS Connection...');

  socket.emit('message', 'Welcome to TuneIn!');
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
