// Accesses chat form
const chatForm = document.getElementById('chat-form');

// Access chat input by id
const msgInput = document.getElementById('msg');

// Accesses emoji button
const emojiBtn = document.getElementById('emoticon');

// Accesses chat messages div so we can implement scroll
const chatMessages = document.querySelector('.chat-messages');

// Accesses room name h2
const roomName = document.getElementById('room-name');

// Accesses users ul
const usersList = document.getElementById('users');

// Accesses Insert YouTube URL form
const youtubeForm = document.getElementById('youtube-form');

//Accesses iframe
const video = document.getElementById('player');

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

// Implement emojis into message form
let picker = new EmojiButton({
  position: 'bottom-start',
});

// User's picked emoji gets added to input form
picker.on('emoji', (emoji) => {
  msgInput.value += emoji;
});

// Event Listener on Emoji Button
emojiBtn.addEventListener('click', () => {
  picker.pickerVisible ? picker.hidePicker() : picker.showPicker(emojiBtn);
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

/* YOUTUBE VIDEO */

//  This code loads the iframe API code asynchrously
let tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// This function creates an <iframe> (and video player) AFTER the API code downloads
let player;
window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: 'bREAWy45IIw',
    playerVars: { autoplay: 1 },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
};

let prevTime;

// The API will call this function when the video player is ready
function onPlayerReady(evt) {
  evt.target.playVideo();

  let playButton = document.getElementById('play-button');
  playButton.addEventListener('click', function () {
    player.playVideo();
    socket.emit('videoPlay');
  });

  let pauseButton = document.getElementById('pause-button');
  pauseButton.addEventListener('click', function () {
    player.pauseVideo();
    socket.emit('videoPause');
  });
}

function stopVideo() {
  player.stopVideo();
}

// The API calls this function when the player's state changes.
function onPlayerStateChange(evt) {
  switch (evt.data) {
    case 0:
      // 0 = Video ended
      break;
    case 1:
      // 1 = Video starts playing
      socket.emit('videoPlay');
      let currentTime = player.getCurrentTime();
      if (currentTime < 0.07) {
        console.log('current time -->', currentTime);
        let videoInfo = player.getVideoData();
        socket.emit('sendTitle', videoInfo.title);
      }
      checkTime(prevTime, currentTime);
      prevTime = currentTime;
      break;
    case 2:
      // 2 = Video has paused
      socket.emit('videoPause');
      break;
    case 3:
      socket.emit('videoPlay');
  }
}

// Listening to server; Plays video
socket.on('playVideo', () => {
  player.playVideo();
  return false;
});

// Listening to server; Pauses video
socket.on('pauseVideo', () => {
  player.pauseVideo();
  return false;
});

// Listening to server; Skips to a certain point in video
socket.on('seekTo', (time) => {
  player.seekTo(time, true);
  return false;
});

// Listening to server; Loads video once id is recieved
socket.on('loadVideo', (id) => {
  // video.setAttribute(
  //   'src',
  //   `https://www.youtube.com/embed/${id}?enablejsapi=1`
  // );
  player.loadVideoById(id);
  return false;
});

// Event Listener on Insert YouTube Link
youtubeForm.addEventListener('submit', (evt) => {
  evt.preventDefault();
  const url = evt.target.elements['youtube-insert'].value;
  // Emits input message to server
  socket.emit('newVideo', url);

  // Clears input message
  evt.target.elements['youtube-insert'].value = '';
});

function checkTime(prevTime, currentTime) {
  if (Math.abs(prevTime - currentTime) > 1) {
    socket.emit('toSeek', currentTime);
  }
}
