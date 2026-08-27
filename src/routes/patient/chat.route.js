const express=require('express')
const router=express.Router()
const validation = require('../../middlewares/validation');
const {uploadFields}=require('../../services/multer/Uploadfile(s).js')
const {
    getOrCreateMyChat,
    sendPatientMessage,
    attachFiles,
}=require('./../../modules/chat/chat.controller.js')
const {
    myChatHistoryVal,
    sendPatientMessageVal,
    attachFilesVal,
}=require('./../../modules/chat/chat.validation.js')

const prefix='chats'
router.get(`/${prefix}`, validation(myChatHistoryVal), getOrCreateMyChat);
router.post(`/${prefix}/messages`, validation(sendPatientMessageVal), sendPatientMessage);
// attaching files to chat
router.post(`/${prefix}/:chat_id/attachments`,
    uploadFields([{name: "attachments",maxCount: 10}], 'Chats/images', 'image'),
    validation(attachFilesVal),
    attachFiles);

module.exports = router;
