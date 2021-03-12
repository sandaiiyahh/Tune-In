const users = [];

// ADDS user to chat (Add user to array)
function joinUser(id, username, room) {
  const user = { id, username, room };

  // Pushes user to list of users
  users.push(user);

  // Returns user object with id, username, and room
  return user;
}

// GET user given ID
function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

// DELETES user given ID
function removeUser(id) {
  const idx = users.findIndex((user) => user.id === id);
  // If you're able to find the user (!== -1),
  if (idx !== -1) {
    // Take the idx of that user, and remove it from array
    return users.splice(idx, 1)[0];
    // Ex. If we're removing Feb (which is idx of 2)
    // ['Jan', 'Feb', 'March', 'April'] ---> ['Jan', 'March', 'April']
    // returns the removed ['Feb'] so [0] --> 'Feb'
  }
}

// GET users in a certain room
function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

module.exports = {
  joinUser,
  getCurrentUser,
  removeUser,
  getRoomUsers,
};
