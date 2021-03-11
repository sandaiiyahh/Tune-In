// Accesses chat form
const chatForm = document.getElementById('chat-form');

const socket = io();

// Message received from server
socket.on('message', (message) => {
  console.log(message);

  outputMessage(message);
});

// Message submit
chatForm.addEventListener('submit', (evt) => {
  // prevents form from refreshing after submitting
  evt.preventDefault();

  // Gets by input id, "msg"
  const msg = evt.target.elements.msg.value;

  // Emits input message to server
  socket.emit('chatMessage', msg);
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  // Adds a 'message' class to newly created div
  div.classList.add('message');
  div.innerHTML = `<p class="meta" id="name">Brandon <span>9:12pm</span></p>
  <p class="text">${message}</p>`;
  // Find chat-messages class and add the div to it
  document.querySelector('.chat-messages').appendChild(div);
}
