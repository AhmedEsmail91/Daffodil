const schedulesRoute=require('./schedules.route.js');
const appointmentRoute=require('./appointment.route.js');
const scopeRoute=require('./scope.route.js');
const chatRoute=require('./chat.route.js');
const {Auth}=require('./../../middlewares/auth.js');

const {Router}=require('express');
const router=Router();

const prefix='patient'
router.use(Auth.Authenticate);
router.use(Auth.allowedToAnd(...['schedule-read','appointment-read','appointment-create']));
router.use(`/${prefix}`,schedulesRoute);
router.use(`/${prefix}`,chatRoute);
router.use(`/${prefix}`,scopeRoute);
router.use(`/${prefix}`,appointmentRoute);
module.exports=router;