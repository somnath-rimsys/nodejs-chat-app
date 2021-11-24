window.onload = function () {
  socket = io();
  const form = document.querySelector("form#chat-form");
  const input = document.getElementById("input");
  const messageContainer = document.getElementById("message-container");
  const shareLocation = document.getElementById("share-location");
  const sidebar = document.getElementById("sidebar");
  const sidebarUsers = sidebar.querySelector("ul");
  const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });

  socket.emit("join", { username, room }, (error) => {
    if (error) {
      alert(error);
      location.href = "/";
    }
  });

  socket.on("welcomeMessage", (message) => {
    const p = document.createElement("p");
    p.classList.add("user-join");
    p.innerHTML = message;
    messageContainer.appendChild(p);
    // autoScroll();
  });

  socket.on("userJoin", (message) => {
    const p = document.createElement("p");
    p.classList.add("user-join");
    p.innerHTML = message;
    messageContainer.appendChild(p);
    // autoScroll();
  });

  socket.on("userLeft", (message) => {
    const p = document.createElement("p");
    p.classList.add("user-left");
    p.innerHTML = message;
    messageContainer.appendChild(p);
    // autoScroll();
  });

  socket.on("receiveMessage", (data) => {
    const div = document.createElement("div");
    const span = document.createElement("span");
    const small = document.createElement("small");
    span.innerHTML = data.message;
    small.innerHTML = data.username + " - " + data.createdAt;
    div.appendChild(span);
    span.appendChild(small);
    if (data.senderId === socket.id) div.classList.add("own-message");
    else div.classList.add("client-message");
    messageContainer.appendChild(div);
    // autoScroll();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value) {
      socket.emit("sendMessage", input.value, (error) => {
        input.value = "";
        if (error) {
          return alert(error);
        }
        // console.log("Message delivered.");
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
        // console.log(status);
      });
    });
  });

  socket.on("receiveLocation", (data) => {
    const div = document.createElement("div");
    const span = document.createElement("span");
    const small = document.createElement("small");
    const a = document.createElement("a");
    a.setAttribute("href", data.location);
    a.setAttribute("target", "_blank");
    a.classList.add("my-location");
    a.innerHTML = "My location";
    span.appendChild(a);
    small.innerHTML = data.username + " - " + data.createdAt;
    div.appendChild(span);
    span.appendChild(small);
    if (data.senderId === socket.id) div.classList.add("own-message");
    else div.classList.add("client-message");
    messageContainer.appendChild(div);
    // autoScroll();
  });

  socket.on("roomData", ({ users, room }) => {
    document.getElementById("room-name").innerHTML = room;
    let temp = "";
    users.forEach((user, index) => {
      temp += `<li ><img src="https://source.unsplash.com/random/40x40?sig=${
        index + 1
      }"><span>${user.username}</span></li>`;
    });
    sidebarUsers.innerHTML = temp;
  });

  const autoScroll = () => {
    //Chat form
    const chatForm = document.getElementById("chat-form");

    // Chat form height
    const chatFormHeight = chatForm.offsetHeight;

    // Caht panel element
    const chatPanel = document.getElementById("chat-panel");

    // Chat panel height
    const chatPanelHeight = chatPanel.scrollHeight - chatFormHeight;

    // New message element
    const $newMessage = messageContainer.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMarginBottom = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMarginBottom;

    // Visible Height
    const visibleHeight = messageContainer.offsetHeight;

    // Heigh of message container
    const containerHeight = messageContainer.scrollHeight - chatFormHeight;

    // How far have I scrolled
    const scrollOffset = messageContainer.scrollTop + visibleHeight - chatFormHeight;

    console.log("chatPanelHeight: ", chatPanelHeight);
    console.log("newMessageHeight: ", newMessageHeight);
    console.log("visibleHeight: ", visibleHeight);
    console.log("containerHeight: ", containerHeight);
    console.log("scrollOffset: ", scrollOffset);
    console.log("---------------------------------------");

    // if (containerHeight - newMessageHeight <= scrollOffset) {
    //   console.log("Here")
    //   messageContainer.scrollTop = messageContainer.scrollHeight;
    // }
    chatPanel.scrollTop = newMessageHeight + visibleHeight;
  };
};
