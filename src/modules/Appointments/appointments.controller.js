// common importing
const AppError = require('../../../utils/errors/AppError.js');
const {catchError} = require('../../../utils/errors/catchError');
const dataQuery = require('../../../utils/QueryBuilders/dataQuery.js');
const ApiFeatures= require('../../../utils/QueryBuilders/Sequelize_API_Fetchers.js');
const { Op } = require('sequelize');
// specific importing
const dotenv = require('dotenv');
dotenv.config({ debug: false,quiet:true });
const { Appointment,User,DoctorSchedule,Doctor } = require('../../../database/models'); 
const {getFormattedDate,announceCalendarEvent} =require('./appointment.service.js');


const createAppointment = catchError(async (req, res,next) => {
  // handle patient info.
  const {
    user_id: patient_id,
    email: patient_email,
    username: patient_name
  } = req.auth;

  const {
    schedule_id,
    type,
    notes,
    appointment_mode
  } = req.body;

  const appointmentData = {
    patient_id,
    schedule_id,
    appointment_mode,
    type,
    notes
  };

  // handle images
  if (req.files.images && req.files.images.length) {
    const images = req.files.images;
    appointmentData.images = images.map(image => ({
      path: image.path.replace(/\\/g, '/').split('uploads/').pop(),
      name: image.originalname
    }));
  }
  // get schedule info if exists.
  const schedule = await DoctorSchedule.findByPk(schedule_id, {
    include: [{
      model: Doctor,
      as: 'doctor',
      include: [{
        model: User,
        as: 'user'
      }]
    }]
  });

  if (!schedule) {
    return next(new AppError('Schedule not found', 404));
  }
  // validate time.
  if (schedule.from < new Date()) {
    return next(new AppError('Schedule is in the past', 400));
  }


  // appointment handling based on mode.
  let response = {};
  let summary;
  let turn;
  if (appointment_mode === "online") {
    // count of online Sessions reserved to get the number of remaining.
    const online_current_turn = await Appointment.count({
      where: {
        schedule_id,
        appointment_mode: "online"
      }
    });
    if (online_current_turn >= schedule.online_cases_number) {
      return next(new AppError('No online slots available for this schedule', 400));
    }    
    turn = online_current_turn + 1;
    summary = `Online - Patient Name ${patient_name} - and the patient turn is ${turn}`;
  } 
  // in-person appointments
  else {
    const current_turn = await Appointment.count({
      where: {
        schedule_id,
        appointment_mode: "in-person"
      }
    });
    turn = current_turn + 1;
    summary = `In-Person - Patient Name : ${patient_name} - and the patient turn is ${turn}`;
    // for in-person appointments limit by max_appointment
    // if (schedule.max_appointment <= 0) {
    //   return next(new AppError('No in-person slots available for this schedule', 400));
    // } 
  }
  appointmentData.title = `${schedule.doctor.name_en} - ${getFormattedDate(schedule.from)} to ${getFormattedDate(schedule.to)}`;
  appointmentData.turn = turn;

  const createdAppointment = await Appointment.create(appointmentData);

  if (!createdAppointment) {
    return next(new AppError('Failed to create appointment', 500));
  }
  const calendarEvent = await announceCalendarEvent(schedule.doctor.user_id, schedule.from, schedule.to, summary, appointment_mode, `Visit the App For details ${process.env.FRONT_BASE_URL}/appointment/${createdAppointment.id}` ,[patient_email]);
  // add the appointment to the doctor calendar

  response.appointment = createdAppointment;
  res.status(201).json({
    message: 'Appointment created successfully',
    calendarEvent
  })
});
const getAppointmentById=catchError(async (req,res,next)=>{
  const appointment_id=req.params.id;
  const appointment=await Appointment.findByPk(appointment_id,{
    include: [{
           model: DoctorSchedule,
           as: 'schedule',
           include: [{
             model: Doctor,
             as: 'doctor'
           }]
         },
         {
           model: User,
           as: 'patient'
         }
       ]
  });
  if(!appointment){
    return next(new AppError('No appointment found with that ID',404));
  }
  res.json({
    status:'success',
    appointment
  });
})
const getAllAppointments=catchError(async (req,res,next)=>{
  const dQuery=new dataQuery();
  // dQuery.attributes=['id','title','notes','turn','images'];
  dQuery.include= [{
         model: DoctorSchedule,
         as: 'schedule',
         include: [{
           model: Doctor,
           as: 'doctor'
         }]
       },
       {
         model: User,
         as: 'patient'
       }
     ]
  const appointments=new ApiFeatures(Appointment,req.query,dQuery).pagination().search(['title','turn']).sort();
  const appointmentsData=await appointments.execute()
  if(appointmentsData.meta.totalResults<1){
    return next(new AppError('No appointments found',404));
  }
  res.json({
    status:'success',
    appointments: appointmentsData
  });
})
const getPatientAppointments=catchError(async (req,res,next)=>{
  const patient_id=req.params.id||req.auth.user_id;
  const dQuery=new dataQuery();
  dQuery.where={
    patient_id
  };
  dQuery.include= [{
         model: DoctorSchedule,
         as: 'schedule',
         include: [{
           model: Doctor,
           as: 'doctor'
         }]
       },
       {
         model: User,
         as: 'patient'
       }
     ]
  const appointments=new ApiFeatures(Appointment,req.query,dQuery).pagination().search(['title','turn']).sort();
  const appointmentsData=await appointments.execute()
  if(appointmentsData.meta.totalResults<1){
    return next(new AppError('No appointments found',404));
  }
  res.json({
    status:'success',
    appointments: appointmentsData
  });
})
const getDoctorAppointments=catchError(async (req,res,next)=>{
  const doctor_id=req.params.id||req.auth.user_id;
  const dQuery=new dataQuery();
  dQuery.include= [{
         model: DoctorSchedule,
         as: 'schedule',
         include: [{
           model: Doctor,
           as: 'doctor'
         }]
       },
       {
         model: User,
         as: 'patient'
       }
     ]
  const appointments=new ApiFeatures(Appointment,req.query,dQuery).pagination().search(['title','turn']).sort();
  const appointmentsData=await appointments.execute()
  if(appointmentsData.meta.totalResults<1){
    return next(new AppError('No appointments found',404));
  }
  res.json({
    status:'success',
    appointments: appointmentsData
  });
})

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  getPatientAppointments,
};