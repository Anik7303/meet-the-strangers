const socket = io();

socket.on("connect", () => {
  console.log(`${socket.id} has connected to socket.io server`);
});
