// socket/modules/chat/chat.controller.js
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const errorEvent = require("../../utils/errors/EventError.js");
const {Chat,Message} = require("../../../../database/models");
// Import Sequelize models via your centralized loader
/**
 * Join Admins room on connection (call this from your main socket connection handler)
 * So that admins can receive global notifications like newChat, newMessage etc.
 */
async function joinAdminsRoom(socket) {
  try {
    if (socket.auth && (socket.auth.role.name === "admin" || socket.auth.role.name === "doctor")) {
      socket.join("admins");
      socket.emit("joinedAdminsRoom", { room: "admins" });
      console.log(`Socket ${socket.id} joined admins room`);
    }
  } catch (err) {
    console.error("joinAdminsRoom error:", err);
  }
}

/**
 * Create or resume a chat session.
 * Accepts anonymous users (no Authenticate required).
 * Expects data: { } optionally handshake.auth.anonymousId used for anonymous users.
 */
async function startChat(socket, data, adminIo) {
  try {
    // Determine patient (authenticated) or anonymous identifier
    const auth = socket.auth || socket.handshake?.auth || {};
    const patientId = socket.auth?.user_id || null;
    // Try find open chat: prefer patient_id match if authenticated, else anonymous
    let chat;
    
    chat = await Chat.findOne({
      where: { patient_id: patientId, status: "open" },
      include:[{model:User,as:'patient',attributes:['id','name','email','phone']}]
    });
    if (!chat) {
      chat = await Chat.create({
        patient_id: patientId
      },{include:[{model:User,as:'patient',attributes:['id','name','email','phone']}]});
    }
    

    // Join socket to chat room (use chat id as room name)
    const room = `chat_${chat.id}`;
    socket.join(room);

    // Attach currentChat to socket for convenience
    socket.currentChatId = chat.id;

    // Emit chatStarted to current socket
    socket.emit("chatStarted", { chat: chat });

    // Notify admins (admins should join 'admins' room separately on connect)
    if (adminIo) {
      adminIo.to("admins").emit("newChat", { chat });
    }
  } catch (err) {
    console.error("startChat error:", err);
    return errorEvent(socket, "startChatError", err.message || "Failed to start chat", err, 500);
  }
}

/**
 * joinChat - allow a socket (admin or patient) to join a chat room
 * data: { chatId }
 */
/**
 * 
 * @param {WebSocket} socket 
 * @param {Object} data 
 * @returns 
 */
async function joinChat(socket, data) {
  try {
    const schema = Joi.object({
      chatId: Joi.string().uuid().required(),
    });
    const validated = await schema.validateAsync(data);

    const room = `chat_${validated.chatId}`;
    socket.join(room);

    // optional: mark this socket as viewing this chat
    socket.currentChatId = validated.chatId;

    socket.emit("joinedChat", { chatId: validated.chatId });
    
  } catch (err) {
    return errorEvent(socket, "joinChatValidation", err.message || "Invalid payload", err, 422);
  }
}

/**
 * sendMessage - save a message and broadcast to room
 * data: { chatId, content }
 * Works for anonymous and authenticated users
 */
/**
 * Handles sending a message in a chat room. Saves the message to the database, updates the chat's last activity,
 * and broadcasts the message to the appropriate chat room and admin room.
 * 
 * @param {WebSocket} socket - The socket instance of the sender.
 * @param {Object} data - The message data containing chatId and content.
 * @param {SocketServer} adminIo - The admin socket server instance for broadcasting to admins.
 * @param {SocketServer} clientIo - The client socket server instance for broadcasting to clients.
 * @returns {void}
 */
async function sendMessage(socket, data, adminIo,clientIo) {
  try {
    const schema = Joi.object({
      chatId: Joi.string().uuid().required(),
      content: Joi.string().min(1).max(5000).required(),
      // optional: type (text/file), metadata etc.
    });

    const validated = await schema.validateAsync(data);

    const chatId = validated.chatId;
    const content = validated.content;

    // Determine sender: if socket.auth present => sender_id and sender_type 'patient' or 'admin' depending on role in auth
    const isAdmin = socket.auth && (socket.auth.role.name === "admin" || socket.auth.role.name === "doctor");
    const sender_type = isAdmin ? "admin" : "patient";
    const sender_id = socket.auth ? socket.auth.user_id : null;

    // Persist message
    const message = await Message.create({
      chat_id: chatId,
      sender_type,
      sender_id,
      content,
      is_pinned: false,
    });

    // Update chat last activity (optional)
    await Chat.update(
      { updatedAt: new Date() },
      { where: { id: chatId } }
    );

    const payload = {
      id: message.id,
      chat_id: message.chat_id,
      sender_type: message.sender_type,
      sender_id: message.sender_id,
      content: message.content,
      is_pinned: message.is_pinned,
      createdAt: message.createdAt,
    };

    // Broadcast to chat room and also notify admins (admins may listen to both)
    const room = `chat_${chatId}`;
    // the sender is admin
    if(isAdmin){
      clientIo.to(room).emit("newMessage", payload);
      socket.emit("newMessage", payload); // echo back to sender
    }
    // sender is patient
    else{
      adminIo.to("admins").emit("newMessage", payload); // admins may want global feed
      adminIo.to(room).emit("newMessage", payload);
      socket.emit("newMessage", payload); // echo back to sender
    }
  } catch (err) {
    console.error("sendMessage error:", err);
    return errorEvent(socket, "sendMessageError", err.message || "Failed to send message", err, 500);
  }
}

/**
 * pinMessage - admin only
 * data: { messageId }
 */
// async function pinMessage(socket, data, next) {
//   try {
//     // Ensure admin
//     if (!socket.auth || !(socket.auth.role.name === "admin" || socket.auth.role.name === "doctor")) {
//       return errorEvent(socket, "forbidden", "Only admins can pin messages", {}, 403);
//     }

//     const schema = Joi.object({
//       messageId: Joi.string().uuid().required(),
//     });

//     const validated = await schema.validateAsync(data);
//     const messageId = validated.messageId;

//     const message = await Message.findByPk(messageId);
//     if (!message) {
//       return errorEvent(socket, "notFound", "Message not found", {}, 404);
//     }

//     // Update message.is_pinned = true
//     await Message.update({ is_pinned: true }, { where: { id: messageId } });

//     // Fetch updated message
//     const updated = await Message.findByPk(messageId);

//     // Broadcast pinned event to chat room
//     const room = `chat_${updated.chat_id}`;
//     socket.server.to(room).emit("messagePinned", {
//       messageId: updated.id,
//       chatId: updated.chat_id,
//       pinnedBy: socket.auth.user_id,
//       pinnedAt: new Date(),
//     });

//     socket.emit("messagePinned", {
//       messageId: updated.id,
//       chatId: updated.chat_id,
//       pinnedBy: socket.auth.user_id,
//       pinnedAt: new Date(),
//     });

    
//   } catch (err) {
//     console.error("pinMessage error:", err);
//     return errorEvent(socket, "pinMessageError", err.message || "Failed to pin message", err, 500);
//   }
// }

/**
 * fetchHistory - optional: fetch last N messages for a chat (used as middleware on socket request)
 * data: { chatId, limit = 50 }
 */
async function fetchHistory(socket, data, next) {
  try {
    const schema = Joi.object({
      chatId: Joi.string().uuid().required(),
      limit: Joi.number().integer().min(1).max(200).default(50),
    });
    const validated = await schema.validateAsync(data);

    const messages = await Message.findAll({
      where: { chat_id: validated.chatId },
      order: [["createdAt", "ASC"]],
      limit: validated.limit,
    });

    socket.emit("chatHistory", { chatId: validated.chatId, messages });
    
  } catch (err) {
    console.error("fetchHistory error:", err);
    return errorEvent(socket, "fetchHistoryError", err.message || "Failed to fetch history", err, 500);
  }
}

module.exports = {
  joinAdminsRoom,
  startChat,
  joinChat,
  sendMessage,
  // pinMessage,
  fetchHistory,
};
