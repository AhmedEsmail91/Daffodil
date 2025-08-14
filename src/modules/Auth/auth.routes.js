const express = require("express");
const authVal = require('./auth.validation')
const validation = require("../../middlewares/validation");

const authController=require('./auth.controller')
// const authMiddleware = require("../../middlewares/auth");

const authRouter = express.Router();

// authRouter.post('/register',
//     validation(authVal.signupSchemaVal),
//     authController.signup);
// authRouter.post('/verifyOTP', validation(authVal.OTPScehma), authController.verifyOTP);

authRouter.post('/login', validation(authVal.signinSchemaVal), authController.signin);
// authRouter.patch('/changePassword',authMiddleware.Authenticate, validation(authVal.changePasswordSchemaVal), authController.changeAuthUserPassword);

// authRouter.post('/resetPassword', validation(authVal.resetPasswordRequestVal), authController.resetPasswordRequest);
// authRouter.patch('/resetUserPassword/:token', validation(authVal.resetUserPasswordVal), authController.resetUserPassword);

module.exports = authRouter;