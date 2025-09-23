const schedulesRoute=require('./schedules.route.js');
const appointmentRoute=require('./appointment.route.js');
const {Auth}=require('./../../middlewares/auth.js');

const {Router}=require('express');
const router=Router();


const prefix='patient'
router.use(Auth.Authenticate);

router.use(`/${prefix}`,schedulesRoute);
router.use(`/${prefix}`,appointmentRoute);
module.exports=router;