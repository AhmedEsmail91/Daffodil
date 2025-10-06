// modules/chat/adminChat.route.js
const { adminAuthenticate } = require("../../middlewares/normalAuth.js");
const { sendMessage,joinAdminsRoom,fetchHistory } = require("./chat.controller.js");


const init = (io, clientIo) => {
  io.use(adminAuthenticate);
  io.on("connection", (socket) => {

    console.log("👨‍💼 Admin connected:", socket.id);

    socket.on("joinAdminsRoom", (data) => joinAdminsRoom(socket, data));
    socket.on("sendMessage", (data) => sendMessage(socket, data,  socket.server, clientIo));
    socket.on("fetchHistory", (data) => fetchHistory(socket, data));
    // socket.on("pinMessage", (data) => pinMessage(socket, data));

    socket.on("disconnect", () => console.log("👨‍💼❌ Admin disconnected:", socket.id));
  });
};

module.exports = { init };
