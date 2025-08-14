const Joi = require('joi');
const errorEvent=require('../utils/errors/EventError.js');
/**
 * Validation middleware for socket.io
 * @param {Joi.ObjectSchema} schema - Joi schema to validate against
 */
function validation(schema) {
    return async (socket, data, next) => {
        try {
            const validated = await schema.validateAsync(data, { abortEarly: false });
            // Attach validated data to socket for further processing
            socket.validatedData = validated;
            next();
        } catch (err) {
            errorEvent(socket, "validation", err.message, err, 422);
        }
    };
}

module.exports =  validation ;
