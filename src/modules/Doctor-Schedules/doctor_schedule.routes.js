const express=require('express')
const router=express.Router()
const  validation  = require('../../middlewares/validation');
const {Auth}=require('./../../middlewares/auth.js');
const {getAllSchedules,setDoctorSchedule, updateSchedule, updateScheduleForced}=require('./doctor_schedule.controller.js')
const {setSchedule}=require('./doctor_schedule.validation.js')
const manage_roles=['schedule-create','schedule-read','schedule-update','schedule-delete'];
router.use(Auth.Authenticate,
//     Auth.allowedTo(...manage_roles)
);
router.get('/',getAllSchedules);
router.post('/set',validation(setSchedule),setDoctorSchedule);
router.put('/update/:id',updateSchedule);
router.put('/forced-update/:id',updateScheduleForced);
module.exports = router;