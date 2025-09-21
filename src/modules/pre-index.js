const rolePermissionRoute = require('./RolePermissions/role_permissions.routes.js');
const userRoute = require('./user/user.routes.js');
const authRouter = require('./Auth/auth.routes.js');
const passport = require('./Auth-Passport/passport.config.js');
const googlePassportRoute = require('./Auth-Passport/strategies/google/google.routes.js');
const doctorRoute = require('./Doctor/doctor.routes.js');
const specialtyRoute = require('./Specialty/specialty.routes.js');
// const googleMeetingRoute=require('./google-meeting/meet.routes.js')
const appointmentRoute=require('./Appointments/appointments.routes.js')
const doctorScheduleRoute=require('./Doctor-Schedules/doctor_schedule.routes.js')

module.exports=(app,prefix)=>{
    app.use(passport.initialize());
    // basic routes:
    app.use(`/${prefix}/auth/google`, googlePassportRoute);
    app.use(`/${prefix}/auth`, authRouter);  //for local authentication
    
    app.use(`/${prefix}/role-permissions`, rolePermissionRoute);
    app.use(`/${prefix}/user`, userRoute);
    //features routes:
    // app.use(`/${prefix}/meetings`, googleMeetingRoute);
    app.use(`/${prefix}/specialty`, specialtyRoute);
    app.use(`/${prefix}/doctor`, doctorRoute);
    app.use(`/${prefix}/doctor-schedule`, doctorScheduleRoute);
    app.use(`/${prefix}/appointment`, appointmentRoute);
    
}