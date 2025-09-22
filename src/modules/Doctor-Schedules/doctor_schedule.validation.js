const Joi= require('joi');
const setSchedule = Joi.object({
    doctor_id: Joi.string().required(),
    from: Joi.date().greater('now').required(),
    to: Joi.date().greater(Joi.ref('from')).required(),
    online_cases_number: Joi.number().min(0).required()
});
const setMultiSchedule = Joi.object({
    doctor_id: Joi.string().required(),
    schedules: Joi.array().items(Joi.object({
        from: Joi.date().greater('now').required(),
        to: Joi.date().greater(Joi.ref('from')).required()
    })).min(1).required(),
    max_appointments_number: Joi.number().min(0).optional(),
    online_cases_number: Joi.number().min(0).required()
});
module.exports={setSchedule,setMultiSchedule}