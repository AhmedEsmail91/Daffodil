const express=require('express')
const router=express.Router()
const  validation  = require('../../middlewares/validation');
const {uploadFields}=require('../../services/multer/Uploadfile(s).js')
const {
    createAppointment,
    getAllAppointments
}=require('./appointments.controller.js')
const schemas=require('./appointments.validation.js')
const {Auth}=require('./../../middlewares/auth.js');

const manage_roles=['appointment-create','appointment-read','appointment-update','appointment-delete'];
router.use(Auth.Authenticate,
//     Auth.allowedTo(...manage_roles)
);
router.post('/', uploadFields(fields = [{name: "images",maxCount: 10}], uploadPath = 'Appointments/images', type = 'image'),
    validation(schemas.makeAppointment),
    createAppointment);
router.get('/', getAllAppointments);
// router.get('/:id', getSpecialty);
// router.patch('/:id', updateSpecialty);
// router.delete('/:id', deleteSpecialty);
module.exports = router;