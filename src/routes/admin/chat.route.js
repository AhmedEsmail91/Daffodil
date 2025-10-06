const router=require("express").Router();

const {getAllChats, getChatById}=require("./../../modules/chat/chat.controller.js");
const prefix='chats'
router.get(`/${prefix}`,getAllChats);
router.get(`/${prefix}/:id`,getChatById);
module.exports=router;