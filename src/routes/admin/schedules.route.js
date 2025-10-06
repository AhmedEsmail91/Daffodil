const express=require('express')
const router=express.Router()
const  validation  = require('../../middlewares/validation');

const {getAllSchedules,setDoctorSchedule, toggleScheduleStatus, updateScheduleForced, getScheduleById, setDoctorMultiSchedule,getScheduleAppointments}=require('./../../modules/Doctor-Schedules/doctor_schedule.controller.js')
const {setSchedule,setMultiSchedule, toggleStatus}=require('./../../modules/Doctor-Schedules/doctor_schedule.validation.js')

const prefix='schedules';


router.get(`/${prefix}/`,getAllSchedules);
router.get(`/${prefix}/:id`,getScheduleById);
router.post(`/${prefix}/set`,validation(setSchedule),setDoctorSchedule);
router.post(`/${prefix}/set/multi`,validation(setMultiSchedule),setDoctorMultiSchedule);
router.patch(`/${prefix}/toggle-status/:id`,validation(toggleStatus),toggleScheduleStatus);
router.put(`/${prefix}/forced-update/:id`,updateScheduleForced);
router.get(`/${prefix}/:id/appointments`,getScheduleAppointments);
module.exports = router;