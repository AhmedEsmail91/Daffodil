const express=require('express')
const router=express.Router()
const  validation  = require('../../middlewares/validation');
const {
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
}=require('./../../modules/Appointments/appointments.controller.js')
const schemas=require('./../../modules/Appointments/appointments.validation.js')
const {Auth}=require('./../../middlewares/auth.js');

const prefix='appointments'

router.get(`/${prefix}`, getAllAppointments);
router.get(`/${prefix}/:id`, getAppointmentById);
router.patch(`/${prefix}/:id`, validation(schemas.updateAppointmentVal),updateAppointment);

// router.delete('/:id', deleteSpecialty);
module.exports = router;