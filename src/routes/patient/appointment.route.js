const express=require('express')
const router=express.Router()
const  validation  = require('../../middlewares/validation');
const {uploadFields}=require('../../services/multer/Uploadfile(s).js')
const {
    createAppointment,
    getPatientAppointments
}=require('./../../modules/Appointments/appointments.controller.js')
const schemas=require('./../../modules/Appointments/appointments.validation.js')
const {Auth}=require('./../../middlewares/auth.js');

const prefix='appointments'
// creating appointment for patient
router.post(`/${prefix}`, uploadFields(fields = [{name: "images",maxCount: 10}], uploadPath = 'Appointments/images', type = 'image'),
    validation(schemas.makeAppointment),
    createAppointment);

router.get(`/${prefix}`, getPatientAppointments);

module.exports = router;