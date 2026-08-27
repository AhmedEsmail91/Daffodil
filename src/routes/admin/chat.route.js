const router=require("express").Router();
const validation = require('../../middlewares/validation');
const { uploadFields } = require("../../services/multer/Uploadfile(s).js");
const {
    getAllChats,
    getChatById,
    sendAdminMessage,
    attachFiles,
    pinMessage,
}=require("./../../modules/chat/chat.controller.js");
const {
    chatIdParamVal,
    sendAdminMessageVal,
    attachFilesVal,
    pinMessageVal,
}=require("./../../modules/chat/chat.validation.js");

const prefix='chats'
router.get(`/${prefix}`,getAllChats);
router.get(`/${prefix}/:id`,validation(chatIdParamVal),getChatById);
router.post(`/${prefix}/:chat_id/messages`, validation(sendAdminMessageVal), sendAdminMessage);
// attaching files to chat
router.post(`/${prefix}/:chat_id/attachments`,
    uploadFields([{name: "attachments",maxCount: 10}], 'Chats/images', 'image'),
    validation(attachFilesVal),
    attachFiles);
router.patch(`/${prefix}/:chatId/messages/:messageId/pin`, validation(pinMessageVal), pinMessage);
module.exports=router;
