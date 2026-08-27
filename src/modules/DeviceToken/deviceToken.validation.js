const Joi = require('joi');

const registerDeviceTokenVal = Joi.object({
    token: Joi.string().min(10).required(),
    platform: Joi.string().valid('web', 'ios', 'android').default('web'),
});

const unregisterDeviceTokenVal = Joi.object({
    token: Joi.string().min(10).required(),
});

module.exports = {
    registerDeviceTokenVal,
    unregisterDeviceTokenVal,
};
