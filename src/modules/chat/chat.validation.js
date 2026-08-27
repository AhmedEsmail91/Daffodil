const Joi = require('joi');

// GET /chats (patient) - fetch/create own chat + history
const myChatHistoryVal = Joi.object({
    limit: Joi.number().integer().min(1).max(200).default(100),
});

// GET /chats/:id - fetch a single chat's messages
const chatIdParamVal = Joi.object({
    id: Joi.string().uuid().required(),
});

// POST /chats/messages (patient) - send a text message, chat is resolved from the auth token
const sendPatientMessageVal = Joi.object({
    content: Joi.string().min(1).max(5000).required(),
});

// POST /chats/:chat_id/messages (admin) - send a text message to a specific chat
const sendAdminMessageVal = Joi.object({
    chat_id: Joi.string().uuid().required(),
    content: Joi.string().min(1).max(5000).required(),
});

// POST /chats/:chat_id/attachments - send a message with file attachments
const attachFilesVal = Joi.object({
    chat_id: Joi.string().uuid().required(),
    content: Joi.string().max(5000).allow('', null).optional(),
    attachments: Joi.array().items(Joi.object().unknown(true)).min(1).required(),
});

// PATCH /chats/:chatId/messages/:messageId/pin
const pinMessageVal = Joi.object({
    chatId: Joi.string().uuid().required(),
    messageId: Joi.string().uuid().required(),
    pinned: Joi.boolean().default(true),
});

module.exports = {
    myChatHistoryVal,
    chatIdParamVal,
    sendPatientMessageVal,
    sendAdminMessageVal,
    attachFilesVal,
    pinMessageVal,
};
