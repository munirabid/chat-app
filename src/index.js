var path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const {
  addUser,
  reomveUser,
  getUser,
  getUersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

let count = 0;
io.on("connection", (socket) => {
  socket.on("join", (options, callback) => {
    //socket.emit() => used to emit event for specific socket.
    //socket.brodcast.emit() => used to emit event for all clients connect except the socket who emited this event
    //io.emit() => to emit an event to all connected clients
    //io.to().emit() => to emit an event for all user in a specific room
    //socket.broadcast.to().emit()=> to emit an event to a room execpt the current cleint

    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUersInRoom(user.room),
    });
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed.");
    }

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback("Delivered");
  });

  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );

    callback();
  });

  socket.on("disconnect", () => {
    const user = reomveUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
