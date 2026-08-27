const express = require('express');
const router = express.Router();
const validation = require('../../middlewares/validation');
const { Auth } = require('../../middlewares/auth.js');
const { registerDeviceToken, unregisterDeviceToken } = require('../../modules/DeviceToken/deviceToken.controller.js');
const { registerDeviceTokenVal, unregisterDeviceTokenVal } = require('../../modules/DeviceToken/deviceToken.validation.js');

const prefix = 'device-tokens';

// Any authenticated user (patient, doctor, or admin) can register/unregister their own device token.
router.use(Auth.Authenticate);

router.post(`/${prefix}`, validation(registerDeviceTokenVal), registerDeviceToken);
router.delete(`/${prefix}`, validation(unregisterDeviceTokenVal), unregisterDeviceToken);

module.exports = router;
