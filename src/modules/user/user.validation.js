const Joi = require('joi');

// Existing schemas...

const createUserSchemaVal = Joi.object({
    username: Joi.string().min(2).max(20).required(),
    email: Joi.string().email().required(),
    role_id: Joi.string().uuid().required(),
    password: Joi.string().pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/).required(),
    rePassword: Joi.valid(Joi.ref('password')).required()
});

const updateUserSchemaVal = Joi.object({
    username: Joi.string().min(2).max(20),
    email: Joi.string().email(),
    role_id: Joi.string().hex().length(24),
    password: Joi.string().pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
}).min(1); // At least one field is required for update

const paramIdSchemaVal = Joi.object({
    id: Joi.string().hex().length(24).required(),
});

module.exports = {
    createUserSchemaVal,
    updateUserSchemaVal,
    paramIdSchemaVal,
};
