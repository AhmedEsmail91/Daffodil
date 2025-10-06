const express=require('express')
const router=express.Router()
const {getAllSchedules,getScheduleById}=require('./../../modules/Doctor-Schedules/doctor_schedule.controller.js')

const prefix='schedules';
const {Auth}=require('./../../middlewares/auth.js');

router.get(`/${prefix}/`,getAllSchedules);
router.get(`/${prefix}/:id`,getScheduleById);

module.exports = router;