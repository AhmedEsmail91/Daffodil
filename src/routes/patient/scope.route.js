const {getAllScopes} = require('../../modules/Scope/scope.controller')
const express = require('express');
const router = express.Router();
const prefix = 'scopes';
router.get(`/${prefix}`, getAllScopes);
module.exports = router;