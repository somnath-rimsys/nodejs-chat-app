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
  const usersModalBody = document.querySelector("#usersModal .modal-body ul");
  var chatPanelOldScrollValue = 0;
  var chatPanelNewScrollValue = 0;

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
    autoScroll();
  });

  socket.on("userJoin", (message) => {
    const p = document.createElement("p");
    p.classList.add("user-join");
    p.innerHTML = message;
    messageContainer.appendChild(p);
    autoScroll();
  });

  socket.on("userLeft", (message) => {
    const p = document.createElement("p");
    p.classList.add("user-left");
    p.innerHTML = message;
    messageContainer.appendChild(p);
    autoScroll();
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
    autoScroll();
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

    autoScroll();

    const $quickAccess = document.getElementById("quick-access");
    $quickAccess.style.display = "none";
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
    usersModalBody.innerHTML = temp;
  });

  document.getElementById("chat-panel").addEventListener("scroll", (e) => {
    chatPanelNewScrollValue = e.target.scrollTop;
    if (chatPanelNewScrollValue >= chatPanelOldScrollValue)
      chatPanelOldScrollValue = chatPanelNewScrollValue;
  });

  const autoScroll = () => {
    const chatPanel = document.getElementById("chat-panel");

    if (chatPanelNewScrollValue === chatPanelOldScrollValue) {
      chatPanel.scrollTop = chatPanel.scrollHeight;
    }
  };

  document.getElementById("chat-panel").addEventListener("click", () => {
    const $quickAccess = document.getElementById("quick-access");
    $quickAccess.style.display = "none";
  });
  document.getElementById("sidebar").addEventListener("click", () => {
    const $quickAccess = document.getElementById("quick-access");
    $quickAccess.style.display = "none";
  });

  const viewUsersLi = document.getElementById("view-users");
  const mediaQuery = window.matchMedia('(min-width: 768px)')
  if (mediaQuery.matches) {
    document.querySelector("#quick-access ul").removeChild(viewUsersLi);
  }
  window.addEventListener("resize", () => {
    if (mediaQuery.matches) {
      if (document.getElementById("view-users"))
        document.querySelector("#quick-access ul").removeChild(viewUsersLi);
    } else {
      if (!document.getElementById("view-users"))
        document.querySelector("#quick-access ul").appendChild(viewUsersLi);
    }
  });
};

function viewUsers() {
  const usersModal = new bootstrap.Modal(
    document.getElementById("usersModal"),
    {
      keyboard: false,
    }
  );
  usersModal.show();
  const $quickAccess = document.getElementById("quick-access");
  $quickAccess.style.display = "none";
}

function toggleQuickAccess() {
  const $quickAccess = document.getElementById("quick-access");
  const currentVisibility = $quickAccess.style.display;
  if (currentVisibility === "none" || currentVisibility === "")
    $quickAccess.style.display = "block";
  else $quickAccess.style.display = "none";
}
