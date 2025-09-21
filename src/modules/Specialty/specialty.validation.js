const Joi= require('joi');
const createSpecialtyVal=Joi.object({
    name_en: Joi.string().min(2).max(100).required(),
    name_ar: Joi.string().min(2).max(100).required(),
    description_en: Joi.string().min(10).max(500).required(),
    description_ar: Joi.string().min(10).max(500).required()
})
const updateSpecialtyVal=Joi.object({
    id: Joi.string().uuid().required(),
    description_en: Joi.string().min(10).max(500).required(),
    description_ar: Joi.string().min(10).max(500).required()
})
const paramIdVal=Joi.object({
    id: Joi.string().uuid().required()
})
module.exports={
    createSpecialtyVal,
    updateSpecialtyVal,
    paramIdVal
}