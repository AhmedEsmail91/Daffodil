const Joi = require('joi')
const signupSchemaVal = Joi.object({
    username: Joi.string().min(2).max(20).required(),
    email: Joi.string().email().required(),
    role_id: Joi.string().hex().length(24).required(),
    password: Joi.string().pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/).required(),
    rePassword: Joi.valid(Joi.ref('password')).required()
})
const signinSchemaVal = Joi.object({ 
    email: Joi.string().email().required(),
    password: Joi.string().pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
})

const changePasswordSchemaVal = Joi.object({
    current: Joi.string().pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/).required(),
    new: Joi.string().pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/).required(),
    reNew: Joi.valid(Joi.ref('new')).required(),
})
const OTPScehma = Joi.object({
    otp: Joi.string().length(6).required(),
    email: Joi.string().email().required(),
})
const resetPasswordRequestVal=Joi.object({
    email: Joi.string().email().required(),
})
const resetUserPasswordVal=Joi.object({
    password: Joi.string().pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/).required(),
    rePassword: Joi.valid(Joi.ref('password')).required(),
    token: Joi.string().required()
})



module.exports= {
    signupSchemaVal,
    signinSchemaVal,
    changePasswordSchemaVal,
    OTPScehma,
    resetPasswordRequestVal,
    resetUserPasswordVal
}