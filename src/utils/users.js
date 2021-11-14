const users = [];

//addUser, removeUser, getUser, getUersInRoom

const addUser = ({ id, username, room }) => {
  //Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //Validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required",
    };
  }

  //Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //Validate user
  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }

  //store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const reomveUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

// addUser({
//   id: 22,
//   username: "munirabid",
//   room: "Southy Philly",
// });

// addUser({
//   id: 42,
//   username: "Mike",
//   room: "Southy Philly",
// });

// addUser({
//   id: 32,
//   username: "Andrew",
//   room: "Centre City",
// });

// console.log(users);

// const res = addUser({
//   id: 22,
//   username: "munirabid",
//   room: "     Southy Philly",
// });

// console.log(res);

// const removedUser = reomveUser(22);
// console.log(removedUser);
// console.log(users);

// const user = getUser(32);
// console.log(user);

module.exports = {
  addUser,
  reomveUser,
  getUser,
  getUersInRoom,
};
