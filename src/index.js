if (process.env.NODE_ENV !== "production") require("dotenv").config();
const http = require("http");
const path = require("path");
const express = require("express");
const { Server } = require("socket.io");

// variables
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || "5000";

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  serveClient: true,
});
let connectedPeers = [];

app.use(express.static(path.join(__dirname, "..", "public")));

io.on("connection", (socket) => {
  connectedPeers.push(socket.id);

  socket.on("pre-offer", (data) => {
    const { calleePersonalCode, callType } = data;
    const index = connectedPeers.findIndex(
      (peer) => peer === calleePersonalCode
    );
    if (index >= 0) {
      const data = {
        callType,
        callerSocketId: socket.id,
      };
      io.to(calleePersonalCode).emit("pre-offer", data);
    } else {
      io.to(socket.id).emit("pre-offer-answer", {
        ...data,
        preOfferAnswer: "CALLEE_NOT_FOUND",
      });
    }
  });

  socket.on("pre-offer-answer", (data) => {
    const { callerSocketId } = data;
    const connectedPeer = connectedPeers.find(
      (peer) => peer === callerSocketId
    );
    if (connectedPeer) {
      io.to(callerSocketId).emit("pre-offer-answer", data);
    }
  });

  socket.on("disconnect", () => {
    connectedPeers = connectedPeers.filter((peer) => peer !== socket.id);
  });
});

httpServer.listen(parseInt(PORT), HOST, () => {
  console.log(`Network:\thttp://${HOST}:${PORT}`);
});

if (process.env.NODE_ENV === "development" && HOST !== "localhost") {
  httpServer.listen(parseInt(PORT), () => {
    console.log(`Local:\t\thttp://localhost:${PORT}`);
  });
}
