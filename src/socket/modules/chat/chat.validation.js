
// socket/modules/chat/chat.validation.js
const Joi = require("joi");

const startChatSchema = Joi.object({
  // optional payload (we accept anonymous via handshake)
});

const joinChatSchema = Joi.object({
  chatId: Joi.string().uuid().required(),
});

const messageSchema = Joi.object({
  chatId: Joi.string().uuid().required(),
  content: Joi.string().min(1).max(5000).required(),
});

const pinSchema = Joi.object({
  messageId: Joi.string().uuid().required(),
});

const historySchema = Joi.object({
  chatId: Joi.string().uuid().required(),
  limit: Joi.number().integer().min(1).max(200).default(50),
});

module.exports = {
  startChatSchema,
  joinChatSchema,
  messageSchema,
  pinSchema,
  historySchema,
};
