const { catchError } = require('../../../utils/errors/catchError');
const AppError = require('../../../utils/errors/AppError.js');
const { DeviceToken } = require('../../../database/models');

// Register (or refresh) a push-notification device token for the authenticated user.
// Idempotent: if the token already exists it is re-linked to the current user and touched.
exports.registerDeviceToken = catchError(async (req, res, next) => {
    console.log('DEBUG registerDeviceToken ENTER', req.body, req.auth?.user_id);
    const user_id = req.auth.user_id;
    const { token, platform } = req.body;

    const [deviceToken] = await DeviceToken.upsert({
        token,
        user_id,
        platform: platform || 'web',
        last_used_at: new Date(),
    }, {
        conflictFields: ['token'],
        returning: true,
    });

    res.status(200).json({
        message: 'Device token registered successfully',
        deviceToken,
    });
});

// Unregister a device token (e.g. on logout / notification opt-out).
exports.unregisterDeviceToken = catchError(async (req, res, next) => {
    const user_id = req.auth.user_id;
    const { token } = req.body;

    const deleted = await DeviceToken.destroy({ where: { token, user_id } });
    if (!deleted) {
        return next(new AppError('Device token not found', 404));
    }

    res.status(200).json({ message: 'Device token unregistered successfully' });
});
