const express = require("express");
const authVal = require('./auth.validation')
const validation = require("../../../middlewares/validation");

const authController=require('./auth.controller')
const authMiddleware = require("../../../middlewares/auth");

const authRouter = express.Router();

// authRouter.post('/register',
//     validation(authVal.signupSchemaVal),
//     authController.signup);
// authRouter.post('/verifyOTP', validation(authVal.OTPScehma), authController.verifyOTP);

authRouter.get('/me', authMiddleware.Auth.Authenticate, authController.verifyToken);
authRouter.get('/firebase-token', authMiddleware.Auth.Authenticate, authController.firebaseToken);
authRouter.post('/refresh', authController.refreshToken);
authRouter.post('/login', validation(authVal.signinSchemaVal), authController.signin);
authRouter.post('/logout', authController.logout);
authRouter.put('/changePassword',authMiddleware.Auth.Authenticate, validation(authVal.changePasswordSchemaVal), authController.changePassword);

// authRouter.post('/resetPassword', validation(authVal.resetPasswordRequestVal), authController.resetPasswordRequest);
// authRouter.patch('/resetUserPassword/:token', validation(authVal.resetUserPasswordVal), authController.resetUserPassword);

module.exports = authRouter;