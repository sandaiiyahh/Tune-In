// Accesses chat input form
const chatForm = document.getElementById('chat-form');

// Accesses chat messages div so we can implement scroll
const chatMessages = document.querySelector('.chat-messages');

// Accesses room name h2
const roomName = document.getElementById('room-name');

// Accesses users ul
const usersList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

/* --------------------------------------------------------- */

/* ROOM INFO */

// Passing in username & room info to server
socket.emit('joinRoom', { username, room });

// Get users in room info
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

/* MESSAGES */

// Message received from server
socket.on('message', (message) => {
  // Function that puts message into DOM chat box
  outputMessage(message);

  // Scrolls down every time we get a message
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Event Listener on Chat Message Form
chatForm.addEventListener('submit', (evt) => {
  // prevents form from refreshing after submitting
  evt.preventDefault();

  // Gets message value by input id, "msg"
  const msg = evt.target.elements.msg.value;

  // Emits input message to server
  socket.emit('chatMessage', msg);

  // Clears input message
  evt.target.elements.msg.value = '';
  evt.target.elements.msg.focus();
});

/* MESSAGE FUNCTION */

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  // Adds a 'message' class to newly created div
  div.classList.add('message');
  div.innerHTML = `<p class="meta" id="name">${message.username}<span> ${message.time}</span></p>
  <p class="text">${message.text}</p>`;
  console.log(message.username);
  if (message.username === 'Cody Bot') {
    div.insertAdjacentHTML(
      'afterbegin',
      '<img src="https://www.dogbible.com/resized/pug-breed-description_default_600.png" width="30rem" />'
    );
  }
  // Find "chat-messages" class and add the div to it
  document.querySelector('.chat-messages').appendChild(div);
}

/* OUTPUT USERS & ROOM INFO FUNCTION */

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM (takes in an array)
function outputUsers(users) {
  usersList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join('')}
  `;
}
