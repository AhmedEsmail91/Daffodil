// utils/getDeviceIdentifier.js

function getDeviceIdentifier(req) {
  const userAgent = req.headers['user-agent'] || 'unknown';
  const platform = req.headers['x-platform'] || 'web'; // web, android, ios

  // From mobile apps: send deviceId in a custom header
  const deviceIdFromHeader = req.headers['x-device-id'];

  let deviceId = deviceIdFromHeader || null;

  if (!deviceId) {
    // Web fallback: use user-agent + IP hash (not reliable but better than nothing)
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    deviceId = Buffer.from(userAgent + ip).toString('base64');
  }

  return {
    deviceId,
    platform,
    userAgent,
  };
};
function checksAuthenticationDeviceAvailability(req, res, next) {
    const { deviceId, platform } = getDeviceIdentifier(req);
    
    if (!deviceId || !platform) {
        return res.status(400).json({ error: "Device identifier or platform is missing" });
    }

    // Attach to request for further use
    req.device = { deviceId, platform };

    next();
}