const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const moment = require("moment");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const publicPath = path.join(__dirname, "../public");
const filter = new Filter();

app.use(express.static(publicPath));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

io.on("connection", (socket) => {
  socket.on("join", ({ username, room }, callBack) => {
    const { user, error } = addUser({ id: socket.id, username, room });

    if (error) {
      return callBack(error);
    }

    socket.join(user.room);
    socket.emit("welcomeMessage", "Welcome to the chat room!");
    socket.broadcast
      .to(user.room)
      .emit("userJoin", `${user.username} has joined the chat`);
    const roomUsers = getUsersInRoom(user.room);
    io.to(user.room).emit("roomData", { room: user.room, users: roomUsers });
    callBack();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      socket.broadcast
        .to(user.room)
        .emit("userLeft", `${user.username} has left the chat`);

      const roomUsers = getUsersInRoom(user.room);
      io.to(user.room).emit("roomData", { room: user.room, users: roomUsers });
    }
  });

  socket.on("sendMessage", (message, callBack) => {
    if (filter.isProfane(message)) {
      return callBack("Profanity is not allowed.");
    }

    // io.emit sends message to every connected clients
    const now = new Date();
    const createdAt = moment(now.getTime()).format("h:mma");
    const user = getUser(socket.id);
    io.to(user.room).emit("receiveMessage", {
      message,
      createdAt,
      senderId: socket.id,
      username: user.username,
    });
    callBack();
  });

  socket.on("sendLocation", (coords, callBack) => {
    coords = JSON.parse(coords);
    const location = `https://google.com/maps?q=${coords.lat},${coords.long}`;
    const now = new Date();
    const createdAt = moment(now.getTime()).format("h:mma");
    const user = getUser(socket.id);
    io.to(user.room).emit("receiveLocation", {
      location,
      createdAt,
      senderId: socket.id,
      username: user.username,
    });
    callBack("Location hared");
  });
});

server.listen(PORT, () => {
  console.log("App started at http://localhost:" + PORT);
});
