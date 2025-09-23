const express=require('express')
const router=express.Router()
const  validation  = require('../../middlewares/validation');
const {Auth}=require('./../../middlewares/auth.js');
const {changeUserToDoctor, getAllDoctors, updateDoctor} = require('./../../modules/Doctor/doctor.controller.js');
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
router.get(`/${prefix}`, getAllDoctors);
router.post(`/${prefix}/changeUserToDoctor/:doctor_id`, changeUserToDoctor);
router.put(`/${prefix}/:id`, updateDoctor);
module.exports = router;