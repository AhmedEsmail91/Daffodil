const {Auth}=require('./../../middlewares/auth.js');
const schedulesRoute=require('./schedules.route.js');
const appointmentsRoute=require('./appointment.route.js');

const {Router}=require('express');
const router=Router();


const prefix='doctor'
const manage_roles=['schedule-read','appointment-read'];
router.use(Auth.Authenticate,
    Auth.allowedToAnd(...manage_roles)
);

router.use(`/${prefix}`,schedulesRoute);
router.use(`/${prefix}`,appointmentsRoute);

module.exports=router;