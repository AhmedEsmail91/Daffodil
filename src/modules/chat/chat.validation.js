const Joi = require('joi');

exports.chatIdParam = Joi.object({
    id: Joi.string().required(),
});
