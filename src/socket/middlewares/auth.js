const redisClient=require('../../../config/redis.js');
const jwt=require('jsonwebtoken');
const cookie=require("cookie");
const { getFullUserData } = require('../../middlewares/auth.js');
const errorEvent = require('../utils/errors/EventError.js');
const env_secret = process.env.JWT_SECRET_KEY;
const secret = Buffer.from(env_secret, 'base64');
/**
 * Socket authentication middleware.
 * @param {Socket} socket - The socket instance.
 * @param {Object} data - The data sent with the socket connection.
 * @param {Function} next - The next middleware function.
 * @returns 
 */
async function authAndAttachToken(socket, data, next) {
    try {
        const { handshake } = socket;
        const cookies = cookie.parse(socket.handshake.headers.cookie || "") || handshake.auth?.token ||handshake.headers?.authorization;
        const token = cookies.token;
        if (!token) return next(new Error("No token provided"));
        if (!token) {
            socket.emit('error_event', { message: 'No token provided' });
        }
        if (token && typeof token !== 'string' || !token.trim()) {
            return errorEvent(socket, 'unauthorized', 'Invalid token format', {}, 401);
        }
        const decoded = jwt.verify(token, secret);
        if (!decoded || !decoded.user_id) {
            return errorEvent(socket, 'unauthorized', 'Invalid token payload', {}, 401);
        }
        socket.auth = decoded;
        // console.log('Socket authenticated:', socket.id, 'User ID:', decoded.user_id);
        next();
    } catch (err) {
        errorEvent(socket, 'unauthorized', err.message);
    }
}
async function Authenticate(socket, data, next) {
    try {
        const { handshake } = socket;
        const cookies = cookie.parse(socket.handshake.headers.cookie || "") || handshake.auth?.token ||handshake.headers?.authorization;
        const token = cookies.token;
        if (!token) return next(new Error("No token provided"));

        if (!token) {
            return errorEvent(socket, 'unauthorized', 'No token provided', {}, 401);
        }
        if (typeof token !== 'string' || !token.trim()) {
            return errorEvent(socket, 'unauthorized', 'Invalid token format', {}, 401);
        }
        const decoded = jwt.verify(token, secret);
        if (!decoded || !decoded.user_id) {
            return errorEvent(socket, 'unauthorized', 'Invalid token payload', {}, 401);
        }
        socket.auth = decoded;
        // console.log('Socket authenticated:', socket.id, 'User ID:', decoded.user_id);
        next();
    } catch (err) {
        errorEvent(socket, 'unauthorized', err.message);
    }
}

/**
 * Middleware factory: checks if the user has the required permissions.
 * @param {string[]} permissions - Array of required permissions.
 * @param {boolean} and - If true, all permissions are required. If false, at least one is enough.
 */
function allowedTo(permissions = [], and = false) {
    return async function (socket, data, next) {
        try {
            const user = socket.auth;
            if (!user) {
                return eventError(socket, 'forbidden', 'User not authenticated');
            }
            const userPermissions = await redisClient.get(`user:${user.user_id}`) ||
                await getFullUserData(user.user_id)
                    .then(user => user.role.permissions.map(p => p.name)); // get the permissions from the user object from redis or DB

            const hasPermission = and
                ? permissions.every(p => userPermissions.includes(p))
                : permissions.some(p => userPermissions.includes(p));

            if (!hasPermission) {
                return errorEvent(socket, 'forbidden', 'User does not have the required permissions',{}, 403);
            }

            next();
        } catch (err) {
            console.error('Socket Permission middleware error:', err.message);
            return errorEvent(socket, 'forbidden', err.message);
        }
    };
}

async function getLang(socket, data, next) {
    try {
        const lang = socket.handshake.headers?.lang || 'en';
        if (typeof lang !== 'string' || lang.length !== 2) {
            return errorEvent(socket, 'validation', 'Invalid language format');
        }

        socket.lang = lang;
        next();
    } catch (err) {
        console.error('Language middleware error:', err.message);
        return errorEvent(socket, 'validation', err.message);
    }
}

module.exports = {
    Authenticate,
    authAndAttachToken,
    allowedTo,
    getLang,
};
