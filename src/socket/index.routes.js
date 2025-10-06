module.exports = (io) => {
if (!io._adminNamespaceInitialized) {
  const clientIo = io.of("/client");
  const adminIo = io.of("/admin");
  // clientIo.on("connection", () => console.log("Client namespace active"));
  // adminIo.on("connection", () => console.log("Admin namespace active"));

  const clientChatRoutes = require("./modules/chat/clientChat.route.js");
  const adminChatRoutes = require("./modules/chat/adminChat.route.js");

  clientChatRoutes.init(clientIo,adminIo);
  adminChatRoutes.init(adminIo,clientIo);

  io._adminNamespaceInitialized = true;
}

};
