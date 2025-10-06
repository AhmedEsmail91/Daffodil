const schedulesRoute=require('./schedules.route.js');
const rolePermissionRoute=require('./role_permissions.route.js');
const doctorRoute=require('./doctor.route.js');
const specialtyRoute=require('./specialty.route.js');
const appointmentRoute=require('./appointment.route.js');
const patientRoute=require('./patient.route.js');
const scopeRoute=require('./scope.route.js');
const chatRoute=require('./chat.route.js');
const {Router}=require('express');
const router=Router();
const {Auth}=require('./../../middlewares/auth.js');

const manage_roles=['doctor-create','schedule-read','schedule-update','schedule-delete'];
const prefix='admin'
router.use(Auth.Authenticate,
    Auth.allowedToAnd(...manage_roles)
);
router.use(`/${prefix}`,specialtyRoute);
router.use(`/${prefix}`,scopeRoute);
router.use(`/${prefix}`,patientRoute);
router.use(`/${prefix}`,appointmentRoute);
router.use(`/${prefix}`,schedulesRoute);
router.use(`/${prefix}`,chatRoute);
router.use(`/${prefix}`,doctorRoute);
router.use(`/${prefix}`,rolePermissionRoute);
module.exports=router;