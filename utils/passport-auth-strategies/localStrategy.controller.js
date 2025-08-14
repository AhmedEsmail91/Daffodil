const passport = require('passport');
const jwt = require('jsonwebtoken');
const jwtConfig = require('./config/jwtConfig');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('./database/models/User');
const AccessToken = require('./database/models/AccessToken');
const Otp = require('../../database/models/Otp');

// Passport serialization for user sessions management
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    if (user) {
        done(null, user);
    } else {
        done(new Error('User was not found: ' + user.contact, null));
    }
});
// authentication strategy for user login
passport.use('user', new LocalStrategy({
    usernameField: 'contact', // the identifier for the user email/contact
    passReqToCallback: true // allows us to pass the request object to the callback
}, async (req, contact, password, done) => {
    try {
        const user = await User.findOne({
            where: {
                contact
            }
        });
        if (!user) {
            return done(null, false, {
                message: `User with contact ${contact} not found.`
            });
        }
        // Asynchronous password comparison
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            return done(null, user);
        } else {
            return done(null, false, {
                message: 'Invalid password.'
            });
        }

    } catch (error) {
        return done(error);
    }
}));


class AuthController {
    static async login(req, res, next) {
        try {
            const user_public_ip = req.headers['cf-connecting-ip'] || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'];

            passport.authenticate('user', async function (err, user, info) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: 'Authentication error',
                        err
                    });
                }
                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: 'Check your contact or Password'
                    });
                }

                if (user.status !== 'active') {
                    return res.status(401).json({
                        success: false,
                        message: 'Your account is not active'
                    });
                }

                if (!user.is_verified) {
                    return res.status(401).json({
                        success: false,
                        message: 'Contact not verified'
                    });
                }

                req.login(user, async (loginErr) => {
                    if (loginErr) {
                        console.error(loginErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Login error',
                            err: loginErr
                        });
                    }
                    // Generate device ID hash
                    const deviceId = crypto.createHash('sha256').update(userAgent + user.contact).digest('hex');
                    // Update last login or other necessary fields
                    await user.save();

                    // Load additional user details if necessary
                    const userFind = await User.findOne({
                        where: {
                            id: user.id
                        },
                        attributes: ['id', 'name', 'contact', 'email', 'user_type'],
                        include: [{
                                model: Supplier,
                                as: 'supplier'
                            },
                            {
                                model: Customer,
                                as: 'customer'
                            }
                        ],
                    });
                    let type_id = null;
                    if (userFind.supplier) {
                        type_id = userFind.supplier.id;
                    } else if (userFind.customer) {
                        type_id = userFind.customer.id;
                    }
                    const expiresIn = '7d'; // or manage via env variables
                    const token = jwt.sign({
                        id: user.id,
                        contact: user.contact,
                        email: user.email,
                        user_type: user.user_type,
                        type_id
                    }, jwtConfig.secret, {
                        expiresIn
                    });

                    // Handle existing session tokens
                    const existingAccessToken = await AccessToken.findOne({
                        where: {
                            user_id: user.id,
                            device_id: deviceId
                        }
                    });

                    if (existingAccessToken) {
                        await existingAccessToken.update({
                            token
                        });
                    } else {
                        await AccessToken.create({
                            user_id: user.id,
                            token,
                            device_id: deviceId
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: "User Login Successfully",
                        data: {
                            user: {
                                ...userFind.get({
                                    plain: true
                                }),
                                token: token
                            }
                        },
                    });
                });
            })(req, res, next);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    }


    // verify otp
    static async verifyOtp(req, res) {
        try {
            const {
                otp,
                contact
            } = req.body;
            const findUser = await User.findOne({
                where: {
                    contact: contact
                },
                attributes: ['id', 'name', 'contact', 'email', 'user_type'],
                include: [{
                        model: Supplier,
                        as: 'supplier'
                    },
                    {
                        model: Customer,
                        as: 'customer'
                    }
                ],
            });
            if (!findUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this contact does not exist.',
                    data: null
                });
            }
            const findOtp = await Otp.findOne({
                where: {
                    user_id: findUser.id,
                    otp
                },
            });

            if (!findOtp) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid OTP',
                    data: null
                });
            }
            if (findOtp.expiry < new Date()) {
                return res.status(400).json({
                    success: false,
                    message: 'OTP Expired',
                    data: null
                });
            }
            await findOtp.destroy();
            const userData = {
                id: findUser.id,
                name: findUser.name,
                user_type: findUser.user_type,
                email: findUser.email,
                contact: findUser.contact,
                type_id: findUser.supplier ? findUser.supplier.id : (findUser.customer ? findUser.customer.id : null),
            };
            let type_id = null;
            if (findUser?.supplier) {
                type_id = findUser.supplier.id;
            } else if (findUser?.customer) {
                type_id = findUser.customer.id;
            }
            userData.type_id = type_id;
            const expiresIn = '1d';
            const token = jwt.sign(userData, jwtConfig.secret, {
                expiresIn
            });

            await findUser.update({
                token,
                is_verified: true,
                status: 'active'
            });
            res.json({
                success: true,
                message: 'OTP Verified',
                data: {
                    userData
                },
                token
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Something is Wrong " + error.message,
                data: []
            });
        }
    }

    // forget password
    static async forgotPassword(req, res) {
        let {
            contact
        } = req.body;
        try {
            const user = await User.findOne({
                where: {
                    contact
                }
            });
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this contact does not exist.'
                });
            }

            let otp = await common.generateOTP();
            const expiry = new Date(Date.now() + 10 * 60 * 1000);
            await Otp.create({
                user_id: user.id,
                otp,
                expiry
            });

            const data = {
                contact: contact,
                otp: otp,
                subject: 'Reset Password OTP',
            };

            // await MailgunService.sendForgotPassword(data);

            res.json({
                success: true,
                message: "OTP Sent To contact",
                data: data
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Something is Wrong " + error.message,
                data: []
            });
        }
    }
    static async resetPassword(req, res) {
        let {
            contact,
            password
        } = req.body;
        try {
            const user = await User.findOne({
                where: {
                    contact
                }
            });
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this contact does not exist.'
                });
            }
            let hashPassword = await bcrypt.hash(password, 10);
            await User.update({
                password: hashPassword
            }, {
                where: {
                    contact: contact
                }
            });
            res.json({
                success: true,
                message: "Password Reset Successfully",
                data: {}
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Something is Wrong " + error.message,
                data: []
            });
        }
    }

    static async logout(req, res) {
        try {
            const authUser = await Common.authUser(req);

            const userAgent = req.headers['user-agent'];
            if (!authUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }
            // Generate device ID hash
            const deviceId = crypto.createHash('sha256').update(userAgent + authUser.contact).digest('hex');
            // Remove access token for this device
            await AccessToken.destroy({
                where: {
                    user_id: authUser.id,
                    device_id: deviceId
                }
            });

            // Optionally clear session/cookie if using sessions
            if (req.session) {
                req.session.destroy(async () => {
                    if (typeof req.logout === 'function') {
                        await req.logout();
                    }
                    res.json({
                        success: true,
                        message: "Logged out successfully"
                    });
                });
            } else {
                if (typeof req.logout === 'function') {
                    await req.logout();
                }
                res.json({
                    success: true,
                    message: "Logged out successfully"
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Something went wrong: " + error.message,
                data: []
            });
        }
    }

    static async catchAll(req, res) {
        return res.status(404).send("Undefined route");
    }
}

module.exports = AuthController;