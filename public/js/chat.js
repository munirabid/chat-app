const socket = io();
//console.log("count has been updated");
const $messageForm = document.querySelector("#chat-form");
const $messageInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplte = document.querySelector("#message-tamplate").innerHTML;
const locationTemplte = document.querySelector("#location-tamplate").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  //New message element
  const $newMessage = $messages.lastElementChild;

  //Height of the new message
  const newMessageStyle = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = $messages.offsetHeight;

  //Height of messages container
  const containerHeight = $messages.scrollHeight;

  //How far have i crolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplte, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (res) => {
  const html = Mustache.render(locationTemplte, {
    username: res.username,
    url: res.url,
    createdAt: moment(res.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

document.getElementById("chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", true);
  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageInput.value = "";
    $messageInput.focus();
    if (error) {
      return;
    }
  });
});

document.querySelector("#send-location").addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by you browser");
  }
  $sendLocationButton.setAttribute("disabled", true);
  navigator.geolocation.getCurrentPosition((showPosition) => {
    const locationObj = {
      latitude: showPosition.coords.latitude,
      longitude: showPosition.coords.longitude,
    };
    socket.emit("sendLocation", locationObj, (error) => {
      $sendLocationButton.removeAttribute("disabled");
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
