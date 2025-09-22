const express=require('express')
const router=express.Router()
const  validation  = require('../../middlewares/validation');
const {uploadFields}=require('../../services/multer/Uploadfile(s).js')
const {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    getPatientAppointments
}=require('./../../modules/Appointments/appointments.controller.js')
const schemas=require('./../../modules/Appointments/appointments.validation.js')
const {Auth}=require('./../../middlewares/auth.js');

const manage_roles=['appointment-create','appointment-read','appointment-update','appointment-delete'];
const auth=router.use(Auth.Authenticate);
const prefix='appointments'
router.post(`/${prefix}`, uploadFields(fields = [{name: "images",maxCount: 10}], uploadPath = 'Appointments/images', type = 'image'),
    validation(schemas.makeAppointment),
    createAppointment);
router.get(`/${prefix}`, getAllAppointments);
router.get(`/${prefix}/patient/me`, getPatientAppointments);
router.get(`/${prefix}/:id`, getAppointmentById);

// router.delete('/:id', deleteSpecialty);
module.exports = router,{auth};