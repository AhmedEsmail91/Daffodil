const {catchError} = require('../../../utils/errors/catchError');
const {Permission,Role,RolePermission,User}= require('./../../../database/models/index.js');
const ApiFeatures= require('../../../utils/QueryBuilders/Sequelize_API_Fetchers.js');
const { Op } = require('sequelize');
const AppError = require('../../../utils/errors/AppError.js');
const dataQuery = require('../../../utils/QueryBuilders/dataQuery.js');
const getAllPermissions=catchError(async(req,res,next)=>{
    const dQuery=new dataQuery()
    dQuery.attributes=['name','id' ];
    const apiFeatures = new ApiFeatures(Permission, req.query,dQuery)
        .pagination()
        .sort()
        .fields()
        .search(['name']);
    const permissions = await apiFeatures.execute();
    res.status(200).json({ success: true, data: permissions.data, meta: permissions.meta });
})
const getPermissionsByRole = catchError(async (req, res, next) => {
    const { roleId } = req.params;
    const role = await Role.findByPk(roleId, {
        include: [{ model: Permission, as: 'permissions' ,through:{ attributes: [] }}]
    });
    if (!role) {
        return next({ status: 404, message: 'Role not found' });
    }
    res.status(200).json({ success: true, data: role });
});
// roles:
const getAllRoles = catchError(async (req, res, next) => {
    const apiFeatures = new ApiFeatures(Role, req.query)
        .pagination()
        .sort()
        .fields()
        .search(['name_en','name_ar']);
    const roles = await apiFeatures.execute();
    res.status(200).json({ success: true, data: roles.data, meta: roles.meta });
});
const createRole = catchError(async (req, res, next) => {
    const { name_en, name_ar, guard_name, permissions } = req.body;

    // Check if role with the same name already exists
    const existingRole = await Role.findOne({
        where: {
            [Op.or]: [{ name_en }, { name_ar }]
        }
    });

    if (existingRole) {
        return next(new AppError(400, 'Role with the same name already exists'));
    }

    // Create the role
    const role = await Role.create({ 
        name_en, 
        name_ar, 
        guard_name: guard_name || null 
    });

    // Assign permissions if provided
    if (permissions && Array.isArray(permissions)) {
        const permissionRecords = await Permission.findAll({
            where: { id: permissions }
        });

        if (permissionRecords.length !== permissions.length) {
            return next(new AppError(400, 'Some permissions do not exist'));
        }

        await role.setPermissions(permissionRecords);
    }
    
    res.status(201).json({ success: true, data: role });
});
const updateRole = catchError(async (req, res, next) => {
    const { id } = req.params;
    const { name_en, name_ar, guard_name, permissions } = req.body;
    const role = await Role.findByPk(id, {
        include: [{ model: Permission, as: 'permissions' }]
    });
    if (!role) {
        return res.status(404).json({ success: false, message: 'Role not found' });
    }

    
    role.name_en = name_en || role.name_en;
    role.name_ar = name_ar || role.name_ar;
    role.guard_name = guard_name || role.guard_name;
    await role.save();

    // Update permissions if provided
    if (permissions && Array.isArray(permissions)) {
        const permissionRecords = await Permission.findAll({
            where: { id: permissions }
        });

        if (permissionRecords.length !== permissions.length) {
            return next(new AppError(400, 'Some permissions do not exist'));
        }

        await role.setPermissions(permissionRecords);
    }

    res.status(200).json({ success: true, data: role });
});
const deleteRole = catchError(async (req, res, next) => {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
        return next({ status: 404, message: 'Role not found' });
    }
    // Check if role has associated users
    const associatedUsers = await User.findAll({ where: { role_id: id } });
    if (associatedUsers.length > 0) {
        return next(new AppError(400, 'Cannot delete role with associated users'));
    }
    await role.destroy();
    res.status(200).json({ success: true, message: 'Role deleted successfully' });
});
const forcedDeleteRole = catchError(async (req, res, next) => {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
        return next({ status: 404, message: 'Role not found' });
    }
    // Check if role has associated users
    const associatedUsers = await User.findAll({ where: { role_id: id } });
    if (associatedUsers.length > 0) {
        associatedUsers.forEach(async (user) => {
            await user.update({ role_id: null , status: 'inactive' }); // Set role_id to null and status to inactive
        });
    }
    await role.destroy();
    res.status(200).json({ success: true, message: 'Role deleted successfully & users updated to be inactive    ' });
});
const getRoleById = catchError(async (req, res, next) => {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
        return next({ status: 404, message: 'Role not found' });
    }
    res.status(200).json({ success: true, data: role });
});
const getRoleByName = catchError(async (req, res, next) => {
    const { name } = req.query;
    const roles = await Role.findAll({
        where: {
            name: {
                [Op.like]: `%${name}%`
            }
        }
    });
    res.status(200).json({ success: true, data: roles });
});
module.exports={
    getAllPermissions,
    getPermissionsByRole,
    getAllRoles,
    createRole,
    updateRole,
    deleteRole,
    getRoleById,
    getRoleByName,
    forcedDeleteRole
}