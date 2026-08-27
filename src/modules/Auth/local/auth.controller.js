const {User,Permission,Role,Doctor}= require("../../../../database/models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {catchError} = require('../../../../utils/errors/catchError');
const AppError = require("../../../../utils/errors/AppError");

const redisClient=require("../../../../config/redis");

const isProduction = process.env.NODE_ENV === "production";

const buildPayload = (user) => ({
    user_id: user.id,
    name: user.username,
    email: user.email,
    role: user.role ? {
        id: user.role.id,
        name: user.role.name_en,
    } : null
});

const signAccessToken = (payload) => {
    const secret = Buffer.from(process.env.JWT_SECRET_KEY, 'base64');
    return jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRATION || "7d" });
};

const signRefreshToken = (payload) => {
    const secret = Buffer.from(process.env.REFRESH_JWT_SECRET_KEY, 'base64');
    return jwt.sign(payload, secret, { expiresIn: process.env.REFRESH_JWT_EXPIRATION || "30d" });
};

// SIGNIN
const signin = catchError(async (req, res, next) => {
    // Validate email and password presence
    const { email, password } = req.body;
    // Find user by email
    const user = await User.findOne({
        where: {
            email,
        },
        include: [{
            model: Role,
            as: 'role',
            attributes: ['id','name_en','name_ar'],
            include: [{
                model: Permission,
                as: 'permissions',
                attributes: ['name'],
                through: { attributes: [] } // Exclude join table attributes
            }]
        }]
    });
    if (!user) {
        return next(new AppError("Invalid email or password", 401));
    }
    if(user.role.name_en === "doctor"){
        const doctor = await Doctor.findOne({where:{user_id:user.id}});
        if(!doctor){
            return next(new AppError("Invalid email or password", 401));
        }
        if (!doctor.approved) {
            return next(new AppError("Your account is not approved yet", 403));
        }
    }
    // Check password validity
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
        return next(new AppError("Invalid email or password", 401));
    }
    const permissions =user.role.permissions.map(p => p.name)
    redisClient.set(`user:${user.id}`, JSON.stringify(permissions))
    // Generate JWT tokens
    const payload = buildPayload(user);
    const token = signAccessToken(payload);
    const refreshToken = signRefreshToken({ user_id: user.id });

    res.cookie("token", token, {
        httpOnly: true,   // prevents JS access (XSS protection)
        secure: isProduction,     // only over HTTPS in production; local HTTP dev needs this off
        sameSite: "strict", // CSRF protection
        maxAge: 60 * 60 * 1000, // 1 hour
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    const resUser={...payload};
    resUser.contact=user.contact;
    resUser.lang=user.preferred_lang || 'en';
    res.status(200).json({ message: "Login successful", user:resUser});
});
const changePassword = catchError(async (req, res, next) => {
    const userId = req.auth.user_id;
    const { current:oldPassword, new: newPassword } = req.body;
    const user = await User.findByPk(userId,{include:[{model:Role,as:'role'}]});
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    const isOldPasswordValid = bcrypt.compareSync(oldPassword, user.password);
    if (!isOldPasswordValid) {
        return next(new AppError("Old password is incorrect", 401));
    }
    // hashing in the db hooks of the user model
    user.password = newPassword;
    await user.save();
    // regenerate token with the same payload shape used at signin/OAuth
    const payload = buildPayload(user);
    const token = signAccessToken(payload);
    res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        maxAge: 60 * 60 * 1000,
    });
    const resUser={...payload};
    resUser.contact=user.contact;
    resUser.lang=user.preferred_lang || 'en';
    res.status(200).json({ message: "Password changed successfully",user:resUser });
});
const verifyToken= catchError(async (req, res, next) => {
    const userId = req.auth.user_id;
    const user = await User.findByPk(userId,{include:[{model:Role,as:'role'}]});
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    const resUser={
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.role ? {
            id: user.role.id,
            name: user.role.name_en,
        } : null,
        lang: user.preferred_lang || 'en'
    }
    res.status(200).json({ message: "Token is valid", user:resUser });
});

const refreshToken= catchError(async (req, res, next) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(401);
    try {
        const secret = Buffer.from(process.env.REFRESH_JWT_SECRET_KEY, 'base64');
        const decoded = jwt.verify(token, secret);

        const user = await User.findByPk(decoded.user_id, {
            include: [{ model: Role, as: 'role', attributes: ['id', 'name_en'] }]
        });
        if (!user) return res.sendStatus(403);

        const payload = buildPayload(user);
        const newAccessToken = signAccessToken(payload);
        res.cookie('token', newAccessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000,
        });

        return res.json({ ok: true, message: "Token refreshed" });
    } catch (err) {
        return res.sendStatus(403); // refresh invalid or expired
    }
});
const logout = catchError(async (req, res, next) => {
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    if (req.cookies.role) {
        res.clearCookie("role");
    }
    res.status(200).json({ message: "Logout successful" });
});
module.exports= {
    signin,
    changePassword,
    verifyToken,
    refreshToken,
    logout
};
