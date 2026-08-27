const router = require("express").Router();

const { startChat, getMyChats } = require("./../../modules/chat/chat.controller.js");
const prefix = 'chats';
router.post(`/${prefix}`, startChat);
router.get(`/${prefix}`, getMyChats);
module.exports = router;
