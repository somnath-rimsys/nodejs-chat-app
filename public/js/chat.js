window.onload = function () {
  socket = io();
  const form = document.querySelector("form#chat-form");
  const input = document.getElementById("input");
  const messageContainer = document.getElementById("message-container");
  const shareLocation = document.getElementById("share-location");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value) {
      socket.emit("socket_clientSend", input.value);
      input.value = "";
    }
  });

  shareLocation.addEventListener("click", () => {
    if (!navigator.geolocation) {
      return alert("Sorry! your browser does not support geoloaction.");
    }

    navigator.geolocation.getCurrentPosition((position) => {
      const location = {
        lat: position.coords.latitude,
        long: position.coords.longitude,
      };
      socket.emit("sendLocation", JSON.stringify(location));
    });
  });

  socket.on("socket_welcomeMessage", (message) => {
    console.log(message);
    document.getElementById("welcome").innerHTML = message;
  });

  socket.on("io_clientReceive", (message) => {
    const li = document.createElement("li");
    li.innerHTML = message;
    messageContainer.appendChild(li);
  });

  socket.on("broadcast_userJoined", (message) => {
    console.log(message);
  });

  socket.on("io_userLeft", (message) => {
    console.log(message);
  });

  socket.on("transmitLocation", (location) => {
    console.log(location);
  });
};
