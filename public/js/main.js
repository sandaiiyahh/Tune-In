// Accesses chat form
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');

const socket = io();

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

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  // Adds a 'message' class to newly created div
  div.classList.add('message');
  div.innerHTML = `<p class="meta" id="name">${message.username}<span> ${message.time}</span></p>
  <p class="text">${message.text}</p>`;
  // Find "chat-messages" class and add the div to it
  document.querySelector('.chat-messages').appendChild(div);
}
