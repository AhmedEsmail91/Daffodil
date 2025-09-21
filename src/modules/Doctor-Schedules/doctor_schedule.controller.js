const {catchError} = require('../../../utils/errors/catchError');
const {User,Doctor,Appointment,DoctorSchedule}= require('./../../../database/models/index.js');
const ApiFeatures= require('../../../utils/QueryBuilders/Sequelize_API_Fetchers.js');
const { Op } = require('sequelize');
const AppError = require('../../../utils/errors/AppError.js');
const dataQuery = require('../../../utils/QueryBuilders/dataQuery.js');
const {sendApologize}=require('../../services/emails/sender-config/sendEmail.js');
const {DateFormat}=require('../../../utils/commons.js')

const getAllSchedules=catchError(async(req,res,next)=>{
    const status=req.query?.status || undefined;
    const dQuery=new dataQuery();
    dQuery.include = [
        {
            model: DoctorSchedule,
            as: 'schedules',
            where: {
                ...(status === 'active' && {
                    from: {
                        [Op.gte]: new Date(),
                    }
                })
            }
        }
    ];
    const doctors=new ApiFeatures(Doctor, req.query,dQuery).search(['name_en'])
    const schedules = await doctors.execute();
    if (schedules.meta.totalResults === 0) {
        return next(new AppError('Doctor Schedules not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            schedules
        }
    });
})
const getDoctorSchedules=catchError(async (req,res,next)=>{
    const doctor_id = req.params.id;
    const schedules = await DoctorSchedule.findAll({
        where: {
            doctor_id
        }
    });
    if (!schedules) {
        return next(new AppError('Schedule not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            schedules
        }
    });
})
const getDoctorScheduleForPatient=catchError(async (req,res,next)=>{
    const doctor_id = req.params.id;
    const schedules = await DoctorSchedule.findAll({
        where: {
            doctor_id,
            from: {
                [Op.gte]: new Date()
            }
        }
    });
    if (!schedules) {
        return next(new AppError('Schedule not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            schedules
        }
    });
})
const setDoctorSchedule = catchError(async (req, res, next) => {
    const {
        doctor_id,
        from,
        to,
        online_cases_number
    } = req.body;

    if (new Date(from) < new Date()) {
        return next(new AppError('Start date cannot be in the past', 400));
    }
    if (new Date(to) < new Date(from)) {
        return next(new AppError('End date cannot be before start date', 400));
    }
    // Find the doctor by id
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }

    // Check if a schedule with the same doctor_id exists
    const existingSchedule = await DoctorSchedule.findOne({
        where: {
            doctor_id: doctor.id,
            from: new Date(from)
        }
    });

    if (existingSchedule) {
        return next(new AppError('A schedule with time already exists for this doctor', 400));
    }

    const schedule = await DoctorSchedule.create({
        doctor_id: doctor.id,
        from: new Date(from),
        to: new Date(to),
        online_cases_number
    });

    res.status(200).json({
        status: 'success',
        message: 'Schedule updated successfully',
        data: {
            schedule
        }
    });
})
const updateSchedule=catchError(async(req,res,next)=>{
    const {
        from,
        to,
        online_cases_number
    } = req.body;
    const schedule_id = req.params.id;
    // Find the doctor by id
    const schedule = await DoctorSchedule.findByPk(schedule_id);
    if (!schedule) {
        return next(new AppError('Schedule not found', 404));
    }
    // checks if that schedule has appointments or not
    const hasAppointments = await Appointment.count({
        where: {
            doctor_id: schedule.doctor_id,
            schedule_id: schedule_id,
            status: "scheduled"
        }
    }) > 0;

    if (hasAppointments) {
        return next(new AppError('Cannot update schedule as it has existing appointments not completed.', 400));
    }
    const updatedSchedule = await DoctorSchedule.update({
        from,
        to,
        online_cases_number
    }, {
        where: {
            id: schedule_id,
            doctor_id: schedule.doctor_id
        }
    });
    if (updatedSchedule[0] === 0) {
        return next(new AppError('Schedule not found or not updated', 404));
    }
    await schedule.save();
    res.status(200).json({
        status: 'success',
        message: 'Schedule updated successfully'
    });
})
const updateScheduleForced=catchError(async (req,res,next)=>{
    const schedule_id = req.params.id;
    const {
        from,
        to,
        online_cases_number
    } = req.body;
    

    const schedule = await DoctorSchedule.findByPk(schedule_id);
    if (!schedule) {
        return next(new AppError('Schedule not found', 404));
    }

    const appointments = await Appointment.findAll({
        where: {
            doctor_id: schedule.doctor_id,
            schedule_id: schedule.id,
            status: 'scheduled'
        },
        include: [{
            model: User,
            as: 'patient',
            attributes: ['id', 'username', 'email', 'preferred_lang']
        }]
    });
    if(appointments.length > 0) {
        const patients=appointments.map(appointment => appointment.patient);
        for (const patient of patients) {
            // sending apology email to all patients apologizing for the schedule change and ask them to reschedule or contact support
            await sendApologize(
                patient.email,
                patient.username,
                schedule.from,
                process.env.MAKE_APPOINTMENT_ROUTE,
                patient.preferred_lang
            );
        }
    }
    await schedule.update({from, to, online_cases_number});
    res.status(200).json({
        status: 'success',
        message: 'Schedule updated successfully',
    });
})

module.exports = {
    getAllSchedules,
    getDoctorScheduleForPatient,
    getDoctorSchedules,
    setDoctorSchedule,
    updateSchedule,
    updateScheduleForced
}