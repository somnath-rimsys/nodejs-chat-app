window.onload = function () {
  socket = io();
  const form = document.querySelector("form#chat-form");
  const input = document.getElementById("input");
  const messageContainer = document.getElementById("message-container");
  const shareLocation = document.getElementById("share-location");

  socket.on("welcomeMessage", (message) => {
    document.getElementById("welcome").innerHTML = message;
  });

  socket.on("userJoin", (message) => {
    console.log(message);
  });

  socket.on("userLeft", (message) => {
    console.log(message);
  });

  socket.on("receiveMessage", (data) => {
    console.log(data)
    console.log(socket.id)
    const span = document.createElement("span");
    const small = document.createElement("small");
    span.innerHTML = data.message;
    small.innerHTML = data.createdAt;
    span.appendChild(small)
    if(data.senderId === socket.id)
      span.classList.add("own-message")
    else
      span.classList.add("client-message")
    messageContainer.appendChild(span);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value) {
      socket.emit("sendMessage", input.value, (error) => {
        if (error) {
          return console.log(error);
        }
        console.log("Message delivered.");
        input.value = "";
      });
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
      socket.emit("sendLocation", JSON.stringify(location), (status) => {
        console.log(status);
      });
    });
  });

  socket.on("receiveLocation", (location) => {
    console.log(location);
  });
};
