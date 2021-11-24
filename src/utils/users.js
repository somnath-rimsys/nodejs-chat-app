const users = [];

const addUser = ({ id, username, room }) => {
  // Validating username and room
  if (!username || !room) {
    return {
      error: "Username and room are required.",
    };
  }

  // Cleaning the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const existingUser = users.find(
    (user) => user.room === room && user.username === username
  );
  if (existingUser) {
    return {
      error: "Username is taken.",
    };
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index != -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  const user = users.find((user) => user.id === id);
  return user;
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  const user = users.filter((user) => user.room === room);
  return user;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
