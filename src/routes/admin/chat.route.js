const router=require("express").Router();
const validation = require("./../../middlewares/validation.js");

const {getAllChats, getChatById, closeChat}=require("./../../modules/chat/chat.controller.js");
const {chatIdParam}=require("./../../modules/chat/chat.validation.js");
const prefix='chats'
router.get(`/${prefix}`,getAllChats);
router.get(`/${prefix}/:id`,getChatById);
router.patch(`/${prefix}/:id/close`, validation(chatIdParam), closeChat);
module.exports=router;