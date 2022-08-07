if (process.env.NODE_ENV !== "production") require("dotenv").config();
const http = require("http");
const path = require("path");
const express = require("express");
const { Server } = require("socket.io");

// variables
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 5000;

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  serveClient: true,
});
let connectedPeers = [];

app.use(express.static(path.join(__dirname, "..", "public")));

io.on("connection", (socket) => {
  connectedPeers.push(socket.id);

  socket.on("disconnect", (reason) => {
    connectedPeers = connectedPeers.filter((peer) => peer !== socket.id);
    console.log(connectedPeers);
  });
});

httpServer.listen(PORT, HOST, () => {
  console.log(`server address: http://${HOST}:${PORT}`);
});
