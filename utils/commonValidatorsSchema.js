module.exports=class validation {
    img = Joi.array().items(Joi.object({
        fieldname: Joi.string().required(),
        originalname: Joi.string().required(),
        encoding: Joi.string().required(),
        mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
        size: Joi.number().max(10485760),
        destination: Joi.string().required(),
        filename: Joi.string().required(),
        path: Joi.string()
    }))
    title = Joi.string().min(2).max(20);
    description = Joi.string().min(2).max(20);
    name = Joi.string().min(2).max(20);
    hexId = Joi.string().hex().length(24);
    email = Joi.string().email();
    password = Joi.string().pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/) // e.g. "Password1!"
    rePassword = Joi.valid(Joi.ref('password'));
    role =(...roles)=> Joi.string().valid(...roles);
}