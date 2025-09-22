const express=require('express')
const router=express.Router()
const  validation  = require('../../middlewares/validation');

const {getAllSchedules,setDoctorSchedule, updateSchedule, updateScheduleForced, getScheduleById, setDoctorMultiSchedule}=require('./../../modules/Doctor-Schedules/doctor_schedule.controller.js')
const {setSchedule,setMultiSchedule}=require('./../../modules/Doctor-Schedules/doctor_schedule.validation.js')

const prefix='schedules';


router.get(`/${prefix}/`,getAllSchedules);
router.get(`/${prefix}/:id`,getScheduleById);
router.post(`/${prefix}/set`,validation(setSchedule),setDoctorSchedule);
router.post(`/${prefix}/set/multi`,validation(setMultiSchedule),setDoctorMultiSchedule);
router.put(`/${prefix}/update/:id`,updateSchedule);
router.put(`/${prefix}/forced-update/:id`,updateScheduleForced);

module.exports = router;