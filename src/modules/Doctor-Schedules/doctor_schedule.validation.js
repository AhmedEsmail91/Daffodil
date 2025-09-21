const Joi= require('joi');
const setSchedule = Joi.object({
    doctor_id: Joi.string().required(),
    from: Joi.date().min('now').required(),
    to: Joi.date().greater(Joi.ref('from')).required(),
    online_cases_number: Joi.number().min(0).required()
});
module.exports={setSchedule}