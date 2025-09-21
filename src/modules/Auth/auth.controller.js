const {User,Permission,Role,Doctor}= require("../../../database/models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {catchError} = require('../../../utils/errors/catchError');
const AppError = require("../../../utils/errors/AppError");

const redisClient=require("../../../config/redis");
// SIGNIN
const signin = catchError(async (req, res, next) => {
    // Ensure `io` is properly defined or remove this line if unnecessary
    if (req.app.get('io')) {
        req.app.get('io').emit('users', {
            message: 'User is signing in'
        });
    }
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
    const secret = Buffer.from(process.env.JWT_SECRET_KEY, 'base64');
    const token = jwt.sign(
        {user_id: user.id, role_id: user.role.id, username:user.username, email:user.email,contact: user.contact},
        secret,
        { expiresIn: process.env.JWT_EXPIRATION || "7d" }
    );
    res.status(200).json({ message: "Login successful", token });
});

module.exports= {
    signin
};