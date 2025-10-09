const Joi= require('joi');
const getDoctorsVal = Joi.object({
    approved: Joi.boolean().optional(),
    schedules_state: Joi.string().valid('active', 'inactive').optional()
}).unknown(true);
const updateDoctorVal = Joi.object({
    name_en: Joi.string().optional(),
    name_ar: Joi.string().optional(),
    specialty_id: Joi.number().integer().optional(),
    licenseNumber: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
    bio_en: Joi.string().optional(),
    bio_ar: Joi.string().optional(),
    approved: Joi.boolean().optional()
}).min(1);
const toggleDoctorApprovalVal = Joi.object({
    id: Joi.string().uuid().required(),
    approved: Joi.boolean().required()
});
module.exports={getDoctorsVal, updateDoctorVal, toggleDoctorApprovalVal}