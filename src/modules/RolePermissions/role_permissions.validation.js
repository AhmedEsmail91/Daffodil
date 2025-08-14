const Joi= require('joi');
const addRole = Joi.object({
    name_en: Joi.string().required(),
    name_ar: Joi.string().required(),
    guard_name: Joi.string().optional().valid('api', 'app'),
    permissions: Joi.array().items(Joi.string().uuid({ version: 'uuidv4' })).required().unique()
    .message({
        'array.unique': 'roles.unique'
    })
});
const paramRoleId = Joi.object({
    roleId: Joi.string().required().uuid({ version: 'uuidv4' })
})
module.exports = {
    addRole,
    paramRoleId
};