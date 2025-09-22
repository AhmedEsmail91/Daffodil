const schedulesRoute=require('./schedules.route.js');
const rolePermissionRoute=require('./role_permissions.route.js');
const doctorRoute=require('./doctor.route.js');
const specialtyRoute=require('./specialty.route.js');
const {Router}=require('express');
const router=Router();
const {Auth}=require('./../../middlewares/auth.js');

const manage_roles=['schedule-create','schedule-read','schedule-update','schedule-delete'];
const prefix='admin'
router.use(Auth.Authenticate,
    // Auth.allowedTo(...manage_roles)
);
router.use(`/${prefix}`,specialtyRoute);
router.use(`/${prefix}`,schedulesRoute);
router.use(`/${prefix}`,doctorRoute);
router.use(`/${prefix}`,rolePermissionRoute);
module.exports=router;