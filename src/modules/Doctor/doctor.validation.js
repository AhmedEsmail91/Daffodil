const Joi= require('joi');
const getDoctorsVal=Joi.object({
    approved:Joi.boolean(),
    schedules_state:Joi.string().valid('active', 'inactive')
})
module.exports={getDoctorsVal}