const { Auth } = require('./../../middlewares/auth.js');
const {getScheduleById, getDoctorSchedules}=require('./../../modules/Doctor-Schedules/doctor_schedule.controller.js')

const express=require('express')
const router=express.Router()

const prefix = 'schedules';

const manage_roles=['schedule-read'];

router.use(Auth.allowedTo(...manage_roles));
router.get(`/${prefix}/`,getDoctorSchedules);
router.get(`/${prefix}/:id`,getScheduleById);

module.exports = router;