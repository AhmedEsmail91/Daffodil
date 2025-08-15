const express=require('express')
const router=express.Router()
const  validation  = require('../../middlewares/validation');
const {Auth}=require('./../../middlewares/auth.js');

const manage_roles=['role-create','role-read','role-update','role-delete'];
router.use(Auth.Authenticate,
    Auth.allowedTo(...manage_roles)
);

module.exports = router;