const express=require('express')
const router=express.Router()
const  validation  = require('../../middlewares/validation');
const {Auth}=require('../../middlewares/auth.js');
const { addRole,paramRoleId } = require('./../../modules/RolePermissions/role_permissions.validation');
const {
    getAllPermissions,
    getPermissionsByRole,
    getAllRoles,
    createRole,
    updateRole,
    deleteRole,
    getRoleById,
    forcedDeleteRole
} = require('./../../modules/RolePermissions/role_permissions.controller');

const manage_roles=['role-create','role-read','role-update','role-delete'];
router.use(Auth.Authenticate,
    Auth.allowedTo(...manage_roles)
);
const prefix='role-permissions';
router.route(`/${prefix}/permissions`).get(getAllPermissions);
router.route(`/${prefix}/role/:roleId/permissions`).get(validation(paramRoleId),getPermissionsByRole);
router.route(`/${prefix}/role`).get(getAllRoles).post(validation(addRole),createRole);
router.route(`/${prefix}/role/:id`).get(getRoleById).put(updateRole).delete(deleteRole);
router.route(`/${prefix}/role/:id/force-delete`).delete(forcedDeleteRole);

module.exports = router;