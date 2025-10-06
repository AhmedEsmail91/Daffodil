const {catchError} = require('../../../utils/errors/catchError');
const {User,Doctor,Appointment,DoctorSchedule, sequelize,Scope}= require('./../../../database/models/index.js');
const ApiFeatures= require('../../../utils/QueryBuilders/Sequelize_API_Fetchers.js');
const { Op, where } = require('sequelize');
const AppError = require('../../../utils/errors/AppError.js');
const dataQuery = require('../../../utils/QueryBuilders/dataQuery.js');
const {sendApologize}=require('../../services/emails/sender-config/sendEmail.js');
const {DateFormat}=require('../../../utils/commons.js')

const getAllSchedules=catchError(async(req,res,next)=>{
    const status=req.query?.status || 'active';
    const dQuery=new dataQuery();
    dQuery.where={
        status:status==="all" ? {[Op.in]:['active','inactive']} : status,
        ...(status === 'active' && {
            from: {
                [Op.gte]: new Date(),
            }
        })
    };
    dQuery.include = [
        {
            model: Doctor,
            as: 'doctor',
            attributes: ['id', 'name_en', 'name_ar']
        },
        {model: Appointment, as: 'appointments', attributes: ['id', 'status']}
    ];
    const doctors=new ApiFeatures(DoctorSchedule, req.query,dQuery).search(['from']).pagination().sort();
    const schedules = await doctors.execute();
    if (schedules.meta.totalResults === 0) {
        return next(new AppError('Doctor Schedules not found', 404));
    }
    res.status(200).json({
        status: 'success',
        schedules
    });
})
const getScheduleById=catchError(async(req,res,next)=>{
    const schedule_id=req.params.id;
    const schedule=await DoctorSchedule.findByPk(schedule_id,{
        include:[
            {
                model:Doctor,
                as:'doctor',
            }
        ]
    });
    if(!schedule){
        return next(new AppError('Schedule not found',404));
    }
    res.status(200).json({
        status:'success',
        data:{
            schedule
        }
    })
})
const getScheduleAppointments=catchError(async(req,res,next)=>{
    const schedule_id=req.params.id;
    const schedule=await DoctorSchedule.findByPk(schedule_id);
    if(!schedule){
        return next(new AppError('Schedule not found',404));
    }
    const dQuery=new dataQuery();
    dQuery.where={
        schedule_id
    };
    dQuery.include=[
        {
            model:User,
            as:'patient',
            attributes:['id','username','email','preferred_lang']
        },
        {
            model:Scope,
            as:'scope',
        },
        {
            model:DoctorSchedule,
            as:'schedule'
        }
    ];
    dQuery.order=[['from','ASC']];
    const appointments=new ApiFeatures(Appointment,req.query,dQuery).pagination().sort().search(['patient.username','patient.email']);
    const results=await appointments.execute();
    if(results.meta.totalResults === 0){
        return next(new AppError('No appointments found for this schedule',404));
    }
    res.status(200).json({
        status:'success',
        data:{
            appointments:results
        }
    })
})
const getDoctorSchedules=catchError(async (req,res,next)=>{
    const {user_id} = req.auth;
    const {status} = req.query||'active';
    // Find the doctor associated with the user_id
    const doctor = await Doctor.findOne({
        where: {
            user_id
        }
    });
    // find the schedules
    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }
    const dQuery=new dataQuery();
    dQuery.where = {
        doctor_id: doctor.id,
        ...(status === 'active' && {
            from: {
                [Op.gte]: new Date()
            }
        })
    };
    dQuery.include = [
        {model:Appointment,as:'appointments'}
    ];
    dQuery.order = [['from', 'ASC']];

    const schedulesQuery=new ApiFeatures(DoctorSchedule, req.query,dQuery)
        .pagination();

    const schedules=await schedulesQuery.execute();

    if (!schedules.meta.totalResults) {
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
    let max_appointments_number=req.body?.max_appointments_number || 20;
    
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
        console.log(existingSchedule);
        return next(new AppError('A schedule with time already exists for this doctor', 400));
    }
    
    const schedule = await DoctorSchedule.create({
        doctor_id: doctor.id,
        from: new Date(from),
        to: new Date(to),
        online_cases_number,
        max_appointments: max_appointments_number
    });

    res.status(200).json({
        status: 'success',
        message: 'Schedule updated successfully',
        data: {
            schedule
        }
    });
})
const setDoctorMultiSchedule = catchError(async (req, res, next) => {
    const {
        doctor_id,
        schedules,
        max_appointments_number = 20,
        online_cases_number = 5
    } = req.body;
    
    // Find the doctor by id
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }

    const schedulesData = [];

    for (const schedule of schedules) {
        const { from, to } = schedule;

        // Check if a schedule with the same doctor_id and time exists
        const existingSchedule = await DoctorSchedule.findOne({
            where: {
                doctor_id: doctor.id,
                from: new Date(from)
            }
        });

        if (existingSchedule) {
            // clear the schedulesData array
            schedulesData.length = 0;
            return next(new AppError(`A schedule with time ${from} already exists for this doctor`, 400));
        }

        let pushedSchedule={
            doctor_id: doctor.id,
            from: new Date(from),
            to: new Date(to),
            online_cases_number,
            max_appointments: max_appointments_number
        }

        schedulesData.push(pushedSchedule);
    }
    await DoctorSchedule.bulkCreate(schedulesData);
    res.status(200).json({
        status: 'success',
        message: 'Schedules created successfully',
        data: {
            schedules: schedulesData
        }
    });
})
const toggleScheduleStatus=catchError(async(req,res,next)=>{
    const schedule_id = req.params.id;
    // Find the doctor by id
    const schedule = await DoctorSchedule.findByPk(schedule_id);
    if (!schedule) {
        return next(new AppError('Schedule not found', 404));
    }
    // checks if that schedule has appointments or not
    const hasAppointments = await Appointment.count({
        where: {
            schedule_id: schedule_id,
            status: {[Op.in]: ['scheduled', 'pending']}
        }
    }) > 0;

    if (hasAppointments) {
        return next(new AppError('schedule.appointmentsExist', 400));
    }
    if (schedule.status === 'active') {
        schedule.status = 'inactive';
    } else if (schedule.status === 'inactive') {
        schedule.status = 'active';
    }
    schedule.updatedAt = new Date();
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
    setDoctorMultiSchedule,
    toggleScheduleStatus,
    getScheduleById,
    getScheduleAppointments,
    updateScheduleForced
}