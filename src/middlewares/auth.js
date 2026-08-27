const jwt = require("jsonwebtoken");
const {
  User,
  Role,
  Permission,
  ProviderAccount
} = require("./../../database/models");
const {catchError} = require("./../../utils/errors/catchError");
const AppError = require("./../../utils/errors/AppError");
const redisClient = require("../../config/redis.js");

const getFullUserData = async (user_id) => {
  const user = await User.findByPk(user_id, {
    include: [{
      model: Role,
      as: 'role',
      attributes: ['id', 'name_en', 'name_ar'],
      include: [{
        model: Permission,
        as: 'permissions',
        attributes: ['name'],
        through: {
          attributes: []
        } 
      }]
    },{
        model:ProviderAccount,
        as: 'providerAccounts',
      }]
  });
  const permissions =user.role.permissions.map(p => p.name)
  redisClient.set(`user:${user.id}`, JSON.stringify(permissions))
  return user;
};

const Auth = class Auth {
  // Only verify token and attach decoded data to req.auth
  static Authenticate = catchError(async (req, res, next) => {
    const getToken = () => {
      if (req.cookies?.token) {
        return req.cookies.token;
      }
      // Fallback: custom header token
      if (req.headers?.token) {
        return req.headers.token;
      }
      // Fallback: Bearer token in Authorization header
      const authHeader = req.headers['authorization'];
      if (authHeader?.startsWith("Bearer ")) {
        return authHeader.split(" ")[1];
      }
      return null;
  }
    const token = getToken();

    if (token && typeof token === "string" && token.trim() && token !== "null" && token !== "undefined") {
      const env_secret = process.env.JWT_SECRET_KEY;
      const secret = Buffer.from(env_secret, 'base64');
      try {
        const decoded = jwt.verify(token, secret);
        req.auth = decoded; // attach decoded token data
        return next();
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          return next(new AppError("Token has expired", 401));
        }
        return next(new AppError("Invalid token", 401));
      }
    }
    return next(new AppError("Unauthorized", 401));
  });
  static getProviderData=catchError(async (req,res,next)=>{
    const userId = req.auth.user_id;
    
    let providerAuthedClientData = await redisClient.get(`user:${userId}-provider`);
    if (!providerAuthedClientData) {
      const user = await getFullUserData(userId);
      providerAuthedClientData = user.providerAccounts.map(provider => ({
        id: provider.id,
        provider: provider.provider,
        accessToken: provider.accessToken,
        refreshToken: provider.refreshToken || null,
        profileJson: provider.profileJson,
      }));
      console.log(JSON.stringify(providerAuthedClientData))
      redisClient.set(`user:${userId}-provider`, JSON.stringify(providerAuthedClientData));
    }
    providerAuthedClientData = JSON.parse(providerAuthedClientData);
    req.auth.providerClient = providerAuthedClientData;
    next();
  })
  static allowedToAnd = (...permissions) => {
    return catchError(async (req, res, next) => {

      const cached = await redisClient.get(`user:${req.auth.user_id}`);
      const currentUserPermissions = cached
        ? JSON.parse(cached)
        : await getFullUserData(req.auth.user_id)
            .then(user => user.role.permissions.map(p => p.name)); // get the permissions from the user object from redis or DB

      if (!permissions.every(permission => currentUserPermissions?.includes(permission))) {
        return next(new AppError("You are not allowed to access this route", 403));
      }
      // console.log(currentUserPermissions)
      return next();
    });
  };
  // Restrict route access by roles
  static allowedTo = (...permissions) => {
    return catchError(async (req, res, next) => {

      const cached = await redisClient.get(`user:${req.auth.user_id}`);
      const currentUserPermissions = cached
        ? JSON.parse(cached)
        : await getFullUserData(req.auth.user_id)
            .then(user => user.role.permissions.map(p => p.name)); // get the permissions from the user object from redis or DB

      if (!permissions.some(permission => currentUserPermissions?.includes(permission))) {
        return next(new AppError("You are not allowed to access this route", 403));
      }
      // console.log(currentUserPermissions)
      return next();
    });
  };
  // Fetch user from DB based on req.auth.userId
  static authUser = catchError(async (req, res, next) => {
    const {
      userId
    } = req.auth || {};

    if (!userId) {
      return next(new AppError("Unauthorized", 401));
    }

    const user = await getFullUserData(userId);

    if (!user) {
      return next(new AppError("User not found or inactive", 401));
    }
    if (user.status !== 'active') {
      return next(new AppError("User is not active please contact support", 403));
    }

    req.user = user;
    return next();
  });
};
module.exports={
  getFullUserData,
  Auth
}