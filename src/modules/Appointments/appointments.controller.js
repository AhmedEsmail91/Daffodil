// common importing
const AppError = require('../../../utils/errors/AppError.js');
const {catchError} = require('../../../utils/errors/catchError');
const dataQuery = require('../../../utils/QueryBuilders/dataQuery.js');
const ApiFeatures= require('../../../utils/QueryBuilders/Sequelize_API_Fetchers.js');
const { Op } = require('sequelize');
// specific importing
const dotenv = require('dotenv');
dotenv.config({ debug: false,quiet:true });
const { Appointment,User,DoctorSchedule,Doctor,Scope, OnlineMeeting, Sequelize} = require('../../../database/models'); 
const {getFormattedDate,announceCalendarEvent} =require('./appointment.service.js');

//Admin 
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
         },
         {model:Scope, as: 'scope' },
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
       },
       {
        model:Scope,
        as: 'scope'
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
const updateAppointment = catchError(async (req, res, next) => {
  const { id } = req.params;
  const { status, appointment_mode, notes, type } = req.body;
  const appointment = await Appointment.findByPk(id, {
    include: [
      {
        model: DoctorSchedule,
        as: 'schedule',
        include: [
          {
            model: Doctor,
            as: 'doctor',
            include: [{ model: User, as: 'user' }]
          }
        ]
      },
      {
        model: User,
        as: 'patient'
      },
      { model: Scope, as: 'scope' },
      { model: OnlineMeeting, as: 'online_meeting' }
    ]
  });

  if (!appointment) {
    return next(new AppError('No appointment found with that ID', 404));
  }

  // Only pending appointments can be updated
  if (appointment.status !== 'pending') {
    return next(new AppError('Only pending appointments can be approved', 400));
  }
  if(status=='canceled'){
    appointment.status = 'canceled';
    console.log('canceled');
    await appointment.save();
    return res.json({
      status: 'success',
      message: 'Appointment canceled successfully',
      appointment
    });
  }
  let updated = false;
  // Status update (Joi ensures it's provided & valid)
  if (appointment.status !== status) {
    appointment.status = status;
    updated = true;
  }

  // Mode update
  if (appointment_mode && appointment_mode !== appointment.appointment_mode) {
    appointment.appointment_mode = appointment_mode;
    updated = true;
  }

  // Notes update (append with timestamp for traceability)
  if (notes && notes !== appointment.notes) {
    const timestamp = new Date().toISOString();
    const formattedNotes = `admin:data:notes::${notes} [${timestamp}]`;
    appointment.notes = appointment.notes
      ? `${appointment.notes}\n${formattedNotes}`
      : formattedNotes;
    updated = true;
  }

  // Type update
  if (type && type !== appointment.type) {
    appointment.type = type;
    updated = true;
  }

  const { schedule_id } = appointment;
  const schedule = appointment.schedule;

  if (!schedule) {
    return next(new AppError('Schedule not found for this appointment', 404));
  }

  // Handle turns
  if (appointment.appointment_mode === 'online') {
    const online_current_turn = await Appointment.count({
      where: {
        schedule_id,
        appointment_mode: 'online',
        status: 'scheduled'
      }
    });

    if (online_current_turn >= schedule.online_cases_number) {
      return next(new AppError('No online slots available for this schedule', 400));
    }

    appointment.turn = online_current_turn + 1;
  } else {
    const current_turn = await Appointment.count({
      where: {
        schedule_id,
        appointment_mode: 'in-person',
        status: 'scheduled'
      }
    });

    appointment.turn = current_turn + 1;
  }

  // Early return if no changes
  if (!updated) {
    return res.json({
      status: 'success',
      message: 'No changes detected',
      appointment
    });
  }

  // Save appointment
  await appointment.save();
  
  // Calendar event
  const turn = appointment.turn;
  const patientName = appointment.patient.username;
  const summary =
    appointment.appointment_mode === 'in-person'
      ? `In-Person - Patient: ${patientName} - Turn: ${turn}`
      : `Online - Patient: ${patientName} - Turn: ${turn}`;
  const details = `Visit the App for details: ${process.env.FRONT_BASE_URL}/appointment/${appointment.id}`;

  const calendarEvent = await announceCalendarEvent(
    appointment.schedule.doctor.user_id,
    appointment.schedule.from,
    appointment.schedule.to,
    summary,
    appointment.appointment_mode,
    details,
    [appointment.patient.email]
  );
  const link=await OnlineMeeting.create({
    appointment_id: appointment.id,
    startTime: appointment.schedule.from,
    endTime: appointment.schedule.to,
    attendees: [appointment.patient.email],
    link: calendarEvent.data.hangoutLink
  });

  res.json({
    status: 'success',
    message: 'Appointment updated successfully',
    appointment,
    link,
    calendarEvent
  });
});

// Patient
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
    appointment_mode,
    scope_id,
    contact,
    countryCode
  } = req.body;

  const appointmentData = {
    patient_id,
    schedule_id,
    scope_id,
    appointment_mode,
    type,
    notes
  };
  //check scope existence:
  const scope=await Scope.findByPk(scope_id);
  if(!scope){
    return next(new AppError('Scope not found',404));
  }
  // handle images
  if (req.files && req.files.images && req.files.images.length) {
    const images = req.files.images;
    appointmentData.images = images.map(image => ({
      url: image.url,
      name: image.originalname
    }));
  }
  // get schedule info if exists.
  const schedule = await DoctorSchedule.findOne({ where: { id: schedule_id, status: 'active' },
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
  if (schedule.to < new Date()) {
    return next(new AppError('Schedule is expired', 400));
  }
  // check existing appointment for this patient in this schedule.
  const existingAppointment = await Appointment.findOne({
    where: {
      patient_id,
      schedule_id,
      status: {
        [Op.in]: ['pending', 'scheduled']
      }
    }
  });
  if (existingAppointment) {
    return next(new AppError('You already have an appointment in this schedule', 400));
  }
  
  appointmentData.title = `${schedule.doctor.name_en} - ${getFormattedDate(schedule.from)} to ${getFormattedDate(schedule.to)}`;
  appointmentData.status = 'pending';

  const createdAppointment = await Appointment.create(appointmentData);

  if (!createdAppointment) {
    return next(new AppError('Failed to create appointment', 500));
  }
  if(contact){
    const user=await User.findByPk(patient_id);
    user.contact=countryCode+':'+contact;
    await user.save();
  }
  res.status(201).json({
    message: 'Appointment created successfully. and your are waiting for approval',
    appointment: createdAppointment,
    paying_methods:{
      VC:process.env.VC_LINK,
      instapay_link:process.env.INSTAPAY_LINK,
      cash:'At the clinic'
    }
  })
});

const getPatientAppointments=catchError(async (req,res,next)=>{
  const patient_id=req.params.id||req.auth.user_id;
  const dQuery=new dataQuery();
  dQuery.where={
    patient_id
  };
  dQuery.attributes = [
  'id',
  'title',
  'notes',
  'turn',
  'images',
  'status',
  'createdAt',
  'appointment_mode',
  'type',
  [
    Sequelize.literal(`
      CASE 
        WHEN POSITION(':' IN "Appointment"."notes") > 0 
        THEN SPLIT_PART("Appointment"."notes", 'admin:data:notes:', 1) 
        ELSE "Appointment"."notes" 
      END
    `),
    'firstPart'
  ]
];
  dQuery.include= [{
         model: DoctorSchedule,
         as: 'schedule',
        //  where:{to:{[Op.gte]:new Date()}},
         include: [{
           model: Doctor,
           as: 'doctor'
         }]
       },
       {
         model: User,
         as: 'patient'
       },
       {
         model: OnlineMeeting,
         as: 'online_meeting'
       },
       {
        model:Scope,
        as:'scope'
       }
     ]
  const appointments=new ApiFeatures(Appointment,req.query,dQuery).pagination().search(['title','turn']).sort();
  const appointmentsData=await appointments.execute()
  // console.log(appointmentsData);
  if(appointmentsData.meta.totalResults<1){
    console.log('No appointments found');
    return next(new AppError('No appointments found',404));
  }
  res.json({
    status:'success',
    appointments: appointmentsData
  });
})

// Doctor
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
       },
        {model:Scope, as: 'scope' }
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
  getDoctorAppointments,
  updateAppointment
};