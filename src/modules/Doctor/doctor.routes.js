const express=require('express')
const router=express.Router()
const  validation  = require('../../middlewares/validation');
const {Auth}=require('./../../middlewares/auth.js');

const manage_roles=['role-create','role-read','role-update','role-delete'];
router.use(Auth.Authenticate,
    Auth.allowedToAnd(...manage_roles)
);
const {changeUserToDoctor, getAllDoctors, resetDoctorPassword} = require('./doctor.controller.js');

router.get('/', getAllDoctors);
router.post('/changeUserToDoctor', changeUserToDoctor);
router.post('/resetDoctorPassword', resetDoctorPassword);

module.exports = router;