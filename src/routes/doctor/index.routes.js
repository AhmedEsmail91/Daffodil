const {Auth}=require('./../../middlewares/auth.js');
const schedulesRoute=require('./schedules.route.js');
const appointmentsRoute=require('./appointment.route.js');

const {Router}=require('express');
const router=Router();


const prefix='doctor'
router.use(Auth.Authenticate);

router.use(`/${prefix}`,schedulesRoute);
router.use(`/${prefix}`,appointmentsRoute);

module.exports=router;