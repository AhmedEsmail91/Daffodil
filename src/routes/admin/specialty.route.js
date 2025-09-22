const express=require('express');
const router=express.Router();
const  validation  = require('./../../middlewares/validation');
const {
    createSpecialty,
    getSpecialties,
    getSpecialty,
    updateSpecialty,
    deleteSpecialty
}=require('./../../modules/Specialty/specialty.controller.js');
const valSchemas=require('./../../modules/Specialty/specialty.validation.js');
const {Auth}=require('./../../middlewares/auth.js');

const fullPermissions=['specialty-create','specialty-read','specialty-update','specialty-delete'];
const prefix='specialties';
router.use(Auth.Authenticate);
router.get(`/${prefix}`,Auth.allowedTo(['specialty-read']), getSpecialties);
router.post(`/${prefix}`,Auth.allowedToAnd(...fullPermissions), validation(valSchemas.createSpecialtyVal), createSpecialty);
router.get(`/${prefix}/:id`,Auth.allowedTo(['specialty-read']), validation(valSchemas.paramIdVal), getSpecialty);
router.put(`/${prefix}/:id`,Auth.allowedToAnd(...fullPermissions), validation(valSchemas.updateSpecialtyVal), updateSpecialty);
router.delete(`/${prefix}/:id`,Auth.allowedToAnd(...fullPermissions), validation(valSchemas.paramIdVal), deleteSpecialty);
module.exports = router;