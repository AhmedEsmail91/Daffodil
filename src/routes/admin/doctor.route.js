const express=require('express')
const router=express.Router()
const  validation  = require('../../middlewares/validation');
const {Auth}=require('./../../middlewares/auth.js');
const {changeUserToDoctor, getAllDoctors,getDoctorsShort, updateDoctor, toggleDoctorApproval} = require('./../../modules/Doctor/doctor.controller.js');
const {getDoctorsVal, toggleDoctorApprovalVal, updateDoctorVal} = require('./../../modules/Doctor/doctor.validation.js');
const manage_roles=[
    'role-create',
    'role-read',
    'role-update',
    'role-delete',
    'user-create',
    'user-read',
    'user-update',
    'user-delete',
    'doctor-create',
    'doctor-read',
    'doctor-update',
    'doctor-delete',
]
// Protect all routes after this middleware
router.use(Auth.Authenticate,
    Auth.allowedToAnd(...manage_roles)
);


const prefix='doctors'
// Routes
router.get(`/${prefix}`,validation(getDoctorsVal), getAllDoctors);
router.patch(`/${prefix}/:id/toggle-approval`,validation(toggleDoctorApprovalVal), toggleDoctorApproval);
router.get(`/${prefix}/short`,validation(getDoctorsVal), getDoctorsShort);
router.put(`/${prefix}/:doctor_id`, changeUserToDoctor);
router.put(`/${prefix}/:id`, validation(updateDoctorVal), updateDoctor);
module.exports = router;