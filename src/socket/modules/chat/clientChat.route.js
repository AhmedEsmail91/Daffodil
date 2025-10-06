const { clientAuthenticate } = require("../../middlewares/normalAuth.js");
const { startChat, joinChat, sendMessage, fetchHistory, joinAdminsRoom } = require("./chat.controller.js");

const init = (io, adminIo) => {
  io.use(clientAuthenticate);

  io.on("connection", (socket) => {
    console.log("👤 Client connected:", socket.id);

    socket.on("startChat", (data) => startChat(socket, data, adminIo));
    socket.on("sendMessage", (data) => sendMessage(socket, data,  adminIo, socket.server));
    socket.on("joinChat", (data) => joinChat(socket, data));
    socket.on("fetchHistory", (data) => fetchHistory(socket, data));
    

    socket.on("disconnect", () => console.log("👤❌ Client disconnected:", socket.id));
  });
};

module.exports = { init };
