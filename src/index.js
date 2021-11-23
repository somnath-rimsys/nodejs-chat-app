const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const moment = require("moment")

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
  console.log("New websocket connection.");

  // Emits the message only to the refering client.
  socket.emit("welcomeMessage", "Welcome!");

  // Broadcasting is sending message to all the clients except the refering client
  socket.broadcast.emit("userJoin", "A new user has joined.");

  socket.on("disconnect", () => {
    socket.broadcast.emit("userLeft", "A user left!");
  });

  socket.on("sendMessage", (message, callBack) => {
    if (filter.isProfane(message)) {
      return callBack("Profanity is not allowed.");
    }

    // io.emit sends message to every connected clients
    const now = new Date();
    const createdAt = moment(now.getTime()).format("h:mma");
    io.emit("receiveMessage", {
      message,
      createdAt,
      senderId: socket.id
    });
    callBack();
  });

  socket.on("sendLocation", (coords, callBack) => {
    coords = JSON.parse(coords);
    const location = `https://google.com/maps?q=${coords.lat},${coords.long}`;
    io.emit("receiveLocation", location);
    callBack("Location hared");
  });
});

server.listen(PORT, () => {
  console.log("App started at http://localhost:" + PORT);
});
