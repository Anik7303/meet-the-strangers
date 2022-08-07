import * as store from "./store.js";

const socket = io();

socket.on("connect", () => {
  store.setSocketId(socket.id);
  console.log(store.getState());
});
