const Joi= require('joi');
const makeAppointment=Joi.object({
    schedule_id: Joi.string().uuid().required(),
    contact: Joi.string().required()
    // .pattern(new RegExp('^\\+?[1-9]\\d{1,14}$'))
    ,
    countryCode: Joi.string().length(2).required(),
    appointment_mode: Joi.string().valid('online', 'in-person').required(),
    type: Joi.string().valid('consultation', 'follow-up', 'emergency').required(),
    notes: Joi.string().max(1000).optional(),
    images: Joi.array().items(Joi.object({
        fieldname: Joi.string().required(),
        originalname: Joi.string().required(),
        encoding: Joi.string().required(),
        mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
        size: Joi.number().max(10485760),
        destination: Joi.string().required(),
        filename: Joi.string().required(),
        path: Joi.string()
    })).max(10).optional(),
    scope_id: Joi.string().uuid().required()
});
const updateAppointmentVal=Joi.object({
    id: Joi.string().uuid().required(),
    appointment_mode: Joi.string().valid('online', 'in-person').optional(),
    type: Joi.string().valid('consultation', 'follow-up', 'emergency').optional(),
    status: Joi.string().valid('pending', 'scheduled', 'canceled', 'completed').required(),
    notes: Joi.string().max(1000).optional(),
});

module.exports={makeAppointment, updateAppointmentVal}