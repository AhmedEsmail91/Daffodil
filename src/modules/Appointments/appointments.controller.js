const {catchError} = require('../../../utils/errors/catchError');
const ApiFeatures= require('../../../utils/QueryBuilders/Sequelize_API_Fetchers.js');
const { Op } = require('sequelize');
const AppError = require('../../../utils/errors/AppError.js');
const dataQuery = require('../../../utils/QueryBuilders/dataQuery.js');
const { ProviderAccount,Appointment,User,DoctorSchedule,Doctor } = require('../../../database/models'); 
const { createMeetEvent, oAuth2Client } = require('./../../services/google/meeting.service.js');
function getFormattedDate(dateInstance){
  return `${dateInstance.getFullYear()}-${(dateInstance.getMonth() + 1).toString().padStart(2, '0')}-${dateInstance.getDate().toString().padStart(2, '0')} ${dateInstance.getHours().toString().padStart(2, '0')}:${dateInstance.getMinutes().toString().padStart(2, '0')}`;
}
async function refreshAccessToken(providerAccount) {
  oAuth2Client.setCredentials({
    refresh_token: providerAccount.refreshToken,
  });

  const { credentials } = await oAuth2Client.refreshAccessToken();
  return credentials.access_token;
}
const createMeeting = async (doctor_user_id, start, end, summary, attendees = []) => {
  const providerAccount = await ProviderAccount.findOne({
    where: { provider: 'google', user_id: doctor_user_id },
  });

  if (!providerAccount) {
    throw new Error('Google account not connected for this doctor');
  }

  // Always refresh the access token before use
  const accessToken = await refreshAccessToken(providerAccount);

  if (providerAccount.accessToken !== accessToken) {
    providerAccount.accessToken = accessToken;
    await providerAccount.save();
  }

  const tokens = {
    accessToken,
    refreshToken: providerAccount.refreshToken,
  };

  // Create Google Meet event
  const meetLink = await createMeetEvent(
    tokens,
    start,
    end,
    summary,
    attendees
  );

  return meetLink;
};
const createAppointment = catchError(async (req, res,next) => {
    const patient_id=req.auth.user_id;
    /* title,notes,images(req.files),schedule_id,patient_id,type(consultation, follow-up, emergency),appointment_mode(online,in-person),turn*/
    const { schedule_id, type, notes, appointment_mode } = req.body;
    const appointmentData = {
        patient_id,
        schedule_id,
        appointment_mode,
        type,
        notes
    };
    if(req.files.images && req.files.images.length){
      const images = req.files.images;
      console.log(images)
      appointmentData.images = images.map(image => ({ path: image.path.replace(/\\/g, '/').split('uploads/').pop(), name: image.originalname }));
    }
    let response={};
    const schedule = await DoctorSchedule.findByPk(schedule_id,{include:[{model:Doctor,as:'doctor',include:[{model:User,as:'user'}]}]});
    if (!schedule) {
        return next(AppError('Schedule not found', 404));
    }
    // validate time.
    if(schedule.from<new Date()){
      return next(AppError('Schedule is in the past', 400));
    }
    // validate online appointment_mode
    if (appointment_mode === "online") {
      // count of online Sessions reserved to get the number of remaining.
      if (schedule.online_cases_number > 0) {
        const current_turn = await Appointment.count({
          where: {
            schedule_id,
            appointment_mode: "online"
          }
        })+1;
        appointmentData.turn = current_turn;
        // create meeting-name to appear in the Google Calendar of the doctor
        const summary = `${schedule.doctor.name_en} - ${getFormattedDate(schedule.from)} to ${getFormattedDate(schedule.to)}`;
        // adding the attendees for this email currently only the patient email we can restrict the access later
        const attendees = [req.auth.email];
        response.link = await createMeeting(schedule.doctor.user_id, schedule.from, schedule.to, summary, attendees);
        schedule.decrement('online_cases_number'); // decrement the available slots by 1
      }
      else {
        return next(new AppError('No online slots available for this schedule', 400));
      }
    }
    else{
      const current_turn = await Appointment.count({
        where: {
          schedule_id,
          appointment_mode: "in-person"
        }
      })+1;
      appointmentData.turn = current_turn;
    }
    if (!schedule.doctor) {
        return next(new AppError('Doctor information not found for this schedule', 404));
    }
    
    appointmentData.title = `${schedule.doctor.name_en} - ${getFormattedDate(schedule.from)} to ${getFormattedDate(schedule.to)}`;
    response.appointmentData = appointmentData;
    const createdAppointment = await Appointment.create(appointmentData);
    response.appointment=createAppointment;
    res.json({
      response
    })
});
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
  createAppointment
};