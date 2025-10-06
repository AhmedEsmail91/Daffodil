const Joi = require('joi');

const scopeValidation = {
    createScope: Joi.object({
        name_en: Joi.string().min(3).max(50).required(),
        name_ar: Joi.string().min(3).max(50).required(),
        description_en: Joi.string().max(255).optional(),
        description_ar: Joi.string().max(255).optional(),
    }),

    updateScope: Joi.object({
        id: Joi.string().uuid().required(),
        name_en: Joi.string().min(3).max(50).optional(),
        name_ar: Joi.string().min(3).max(50).optional(),
        description_en: Joi.string().max(255).optional(),
        description_ar: Joi.string().max(255).optional(),
    }),

    deleteScope: Joi.object({
        id: Joi.string().uuid().required(),
    }),

    getScope: Joi.object({
        id: Joi.string().uuid().required(),
    }),
};

module.exports = scopeValidation;