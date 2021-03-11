const moment = require('moment'); // gets time

function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format('h:mm a'),
  };
}

module.exports = formatMessage;
// We can now use formatMessage func in our server.js
