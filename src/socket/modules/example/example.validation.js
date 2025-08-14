const Joi=require('joi');
const testSchema=Joi.object({
    id:Joi.string().uuid().required(),
    name:Joi.string().min(2).max(100).required(),
    age:Joi.number().min(0).required()
});

module.exports={testSchema};
