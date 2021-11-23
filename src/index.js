const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const publicPath = path.join(__dirname, "../public");

app.use(express.static(publicPath));
// app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

io.on("connection", (socket) => {
  console.log("New websocket connection.");

  // Emits the message only to the refering client.
  socket.emit("socket_welcomeMessage", "Welcome!");

  // Broadcasting is sending message to all the clients except the refering client
  socket.broadcast.emit("broadcast_userJoined", "A new user has joined.");

  socket.on("socket_clientSend", (message) => {
    // io.emit sends message to every connected clients
    io.emit("io_clientReceive", message);
  });

  socket.on("sendLocation", (coords) => {
    coords = JSON.parse(coords);
    const location = `https://google.com/maps?q=${coords.lat},${coords.long}`;
    io.emit("transmitLocation", location);
  });

  socket.on("disconnect", () => {
    io.emit("io_userLeft", "A user left!");
  });
});

server.listen(PORT, () => {
  console.log("App started at http://localhost:" + PORT);
});
