const {User,Permission,Role,Doctor}= require("../../../../database/models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {catchError} = require('../../../../utils/errors/catchError');
const AppError = require("../../../../utils/errors/AppError");

const redisClient=require("../../../../config/redis");
const { mintFirebaseCustomToken } = require("../../../../config/firebase");
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
    // Generate JWT token
    const payload={
        user_id: user.id,
        name: user.username,
        email: user.email,
        role: user.role ? {
            id: user.role.id,
            name: user.role.name_en,
        } : null
    }
    console.log(JSON.stringify(payload))
    const secret = Buffer.from(process.env.JWT_SECRET_KEY, 'base64');
    const token = jwt.sign(
        payload,
        secret,
        { expiresIn: process.env.JWT_EXPIRATION || "7d" }
    );
    
    res.cookie("token", token, {
        httpOnly: true,   // prevents JS access (XSS protection)
        secure: true,     // only over HTTPS
        sameSite: "strict", // CSRF protection
        maxAge: 60 * 60 * 1000, // 1 hour
    });
    const resUser=payload;
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
    // regenerate token
    const secret = Buffer.from(process.env.JWT_SECRET_KEY, 'base64');
    const token = jwt.sign(
        {
            user_id: user.id,
            role_id: user.role ? user.role.id : null,
            username: user.username || null,
            email: user.email,
            contact: user.contact || null
        },
        secret,
        { expiresIn: process.env.JWT_EXPIRATION || "7d" }
    );
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
    });
    res.status(200).json({ message: "Password changed successfully",user });
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

// Mints a Firebase custom token for the already-authenticated user, so the
// client can sign into Firebase and use Firestore (chat) directly.
const firebaseToken = catchError(async (req, res, next) => {
    const firebaseToken = await mintFirebaseCustomToken(req.auth);
    res.status(200).json({ message: "Firebase token issued", firebaseToken });
});

const refreshToken= catchError(async (req, res, next) => {
     const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);
    try {
        const secret = Buffer.from(process.env.REFRESH_JWT_SECRET_KEY, 'base64');
    const payload = jwt.verify(refreshToken, secret);

    const newAccessToken = createAccessToken({ id: payload.id });
    res.cookie('token', newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 min
    });

    return res.json({ ok: true });
  } catch (err) {
    return res.sendStatus(403); // refresh invalid
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
    firebaseToken,
    refreshToken,
    logout
};