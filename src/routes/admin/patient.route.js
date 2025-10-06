// const validation=require('../../middlewares/validation.middleware.js');
const patientController=require('../../modules/Patient/patient.controller.js');
const {Auth}=require('../../middlewares/auth.js');
const router=require('express').Router();
const prefix='patients';
router.use(Auth.Authenticate);

router.route(`/${prefix}`)
    .get(patientController.getAllPatients)
    // .post(
    //     validation.validateRequestBody(patientValidationSchema),
    //     patientController.createPatient
    // );

// router.route('/:id')
//     .get(patientController.getPatientById)
//     .put(
//         validation.validateRequestBody(patientValidationSchema),
//         patientController.updatePatient
//     )
//     .delete(patientController.deletePatient);

module.exports=router;