const adminRoute = require('./admin/index.routes.js');
const doctorRoute = require('./doctor/index.routes.js');
const patientRoute = require('./patient/index.routes.js');
const sharedRoute = require('./shared/deviceToken.route.js');

const authRouter = require('./../modules/Auth/local/auth.routes.js');
const passport = require('./../../config/passport.js');
const googlePassportRoute = require('./../routes/auth/google.routes.js');


module.exports=(app,prefix)=>{
    app.use(passport.initialize());
    // basic routes:
    app.use(`/${prefix}/auth/google`, googlePassportRoute);
    app.use(`/${prefix}/auth`, authRouter);  //for local authentication

    //features routes:
    app.use(`/${prefix}`, adminRoute);
    app.use(`/${prefix}`, doctorRoute);
    app.use(`/${prefix}`, patientRoute);

    // shared, role-agnostic routes (any authenticated user)
    app.use(`/${prefix}`, sharedRoute);
}