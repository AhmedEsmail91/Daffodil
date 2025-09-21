const express=require('express');
const router=express.Router();
const  validation  = require('../../middlewares/validation');
const {
    createSpecialty,
    getSpecialties,
    getSpecialty,
    updateSpecialty,
    deleteSpecialty
}=require('./specialty.controller.js');
const valSchemas=require('./specialty.validation.js');
const {Auth}=require('./../../middlewares/auth.js');

const fullPermissions=['specialty-create','specialty-read','specialty-update','specialty-delete'];
router.use(Auth.Authenticate);
router.get('/',Auth.allowedTo(['specialty-read']), getSpecialties);
router.post('/',Auth.allowedToAnd(...fullPermissions), validation(valSchemas.createSpecialtyVal), createSpecialty);
router.get('/:id',Auth.allowedTo(['specialty-read']), validation(valSchemas.paramIdVal), getSpecialty);
router.put('/:id',Auth.allowedToAnd(...fullPermissions), validation(valSchemas.updateSpecialtyVal), updateSpecialty);
router.delete('/:id',Auth.allowedToAnd(...fullPermissions), validation(valSchemas.paramIdVal), deleteSpecialty);
module.exports = router;