const router=require('express').Router();
const {createMeeting}=require('./meet.controller.js')
const {Auth}=require('../../middlewares/auth.js')
router.use(Auth.Authenticate)
router.post('/generate-meeting',createMeeting)
module.exports=router