"use strict";

var _require = require("../../../../database/models"),
    User = _require.User,
    Permission = _require.Permission,
    Role = _require.Role,
    Doctor = _require.Doctor;

var jwt = require("jsonwebtoken");

var bcrypt = require("bcrypt");

var _require2 = require('../../../../utils/errors/catchError'),
    catchError = _require2.catchError;

var AppError = require("../../../../utils/errors/AppError");

var redisClient = require("../../../../config/redis"); // SIGNIN


var signin = catchError(function _callee(req, res, next) {
  var _req$body, email, password, user, doctor, isPasswordValid, permissions, secret, token;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // Ensure `io` is properly defined or remove this line if unnecessary
          if (req.app.get('io')) {
            req.app.get('io').emit('users', {
              message: 'User is signing in'
            });
          } // Validate email and password presence


          _req$body = req.body, email = _req$body.email, password = _req$body.password; // Find user by email

          _context.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              email: email
            },
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
                } // Exclude join table attributes

              }]
            }]
          }));

        case 4:
          user = _context.sent;

          if (user) {
            _context.next = 7;
            break;
          }

          return _context.abrupt("return", next(new AppError("Invalid email or password", 401)));

        case 7:
          if (!(user.role.name_en === "doctor")) {
            _context.next = 15;
            break;
          }

          _context.next = 10;
          return regeneratorRuntime.awrap(Doctor.findOne({
            where: {
              user_id: user.id
            }
          }));

        case 10:
          doctor = _context.sent;

          if (doctor) {
            _context.next = 13;
            break;
          }

          return _context.abrupt("return", next(new AppError("Invalid email or password", 401)));

        case 13:
          if (doctor.approved) {
            _context.next = 15;
            break;
          }

          return _context.abrupt("return", next(new AppError("Your account is not approved yet", 403)));

        case 15:
          // Check password validity
          isPasswordValid = bcrypt.compareSync(password, user.password);

          if (isPasswordValid) {
            _context.next = 18;
            break;
          }

          return _context.abrupt("return", next(new AppError("Invalid email or password", 401)));

        case 18:
          permissions = user.role.permissions.map(function (p) {
            return p.name;
          });
          redisClient.set("user:".concat(user.id), JSON.stringify(permissions)); // Generate JWT token

          secret = Buffer.from(process.env.JWT_SECRET_KEY, 'base64');
          token = jwt.sign({
            user_id: user.id,
            role_id: user.role.id,
            username: user.username,
            email: user.email,
            contact: user.contact
          }, secret, {
            expiresIn: process.env.JWT_EXPIRATION || "7d"
          });
          res.cookie("token", token, {
            httpOnly: true,
            // prevents JS access (XSS protection)
            secure: true,
            // only over HTTPS
            sameSite: "strict",
            // CSRF protection
            maxAge: 60 * 60 * 1000 // 15 min

          });
          res.status(200).json({
            message: "Login successful",
            role: user.role.name_en,
            user: user
          });

        case 24:
        case "end":
          return _context.stop();
      }
    }
  });
});
var changePassword = catchError(function _callee2(req, res, next) {
  var userId, _req$body2, oldPassword, newPassword, user, isOldPasswordValid, secret, token;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          userId = req.auth.user_id;
          _req$body2 = req.body, oldPassword = _req$body2.current, newPassword = _req$body2["new"];
          _context2.next = 4;
          return regeneratorRuntime.awrap(User.findByPk(userId, {
            include: [{
              model: Role,
              as: 'role'
            }]
          }));

        case 4:
          user = _context2.sent;

          if (user) {
            _context2.next = 7;
            break;
          }

          return _context2.abrupt("return", next(new AppError("User not found", 404)));

        case 7:
          isOldPasswordValid = bcrypt.compareSync(oldPassword, user.password);

          if (isOldPasswordValid) {
            _context2.next = 10;
            break;
          }

          return _context2.abrupt("return", next(new AppError("Old password is incorrect", 401)));

        case 10:
          // hashing in the db hooks of the user model
          user.password = newPassword;
          _context2.next = 13;
          return regeneratorRuntime.awrap(user.save());

        case 13:
          // regenerate token
          secret = Buffer.from(process.env.JWT_SECRET_KEY, 'base64');
          token = jwt.sign({
            user_id: user.id,
            role_id: user.role ? user.role.id : null,
            username: user.username || null,
            email: user.email,
            contact: user.contact || null
          }, secret, {
            expiresIn: process.env.JWT_EXPIRATION || "7d"
          });
          res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000
          });
          res.status(200).json({
            message: "Password changed successfully",
            user: user
          });

        case 17:
        case "end":
          return _context2.stop();
      }
    }
  });
});
var verifyToken = catchError(function _callee3(req, res, next) {
  var userId, user;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          userId = req.auth.user_id;
          _context3.next = 3;
          return regeneratorRuntime.awrap(User.findByPk(userId, {
            include: [{
              model: Role,
              as: 'role'
            }]
          }));

        case 3:
          user = _context3.sent;

          if (user) {
            _context3.next = 6;
            break;
          }

          return _context3.abrupt("return", next(new AppError("User not found", 404)));

        case 6:
          res.status(200).json({
            message: "Token is valid",
            user: user
          });

        case 7:
        case "end":
          return _context3.stop();
      }
    }
  });
});
var refreshToken = catchError(function _callee4(req, res, next) {
  var refreshToken, secret, payload, newAccessToken;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          refreshToken = req.cookies.refreshToken;

          if (refreshToken) {
            _context4.next = 3;
            break;
          }

          return _context4.abrupt("return", res.sendStatus(401));

        case 3:
          _context4.prev = 3;
          secret = Buffer.from(process.env.REFRESH_JWT_SECRET_KEY, 'base64');
          payload = jwt.verify(refreshToken, secret);
          newAccessToken = createAccessToken({
            id: payload.id
          });
          res.cookie('token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000 // 15 min

          });
          return _context4.abrupt("return", res.json({
            ok: true
          }));

        case 11:
          _context4.prev = 11;
          _context4.t0 = _context4["catch"](3);
          return _context4.abrupt("return", res.sendStatus(403));

        case 14:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[3, 11]]);
});
var logout = catchError(function _callee5(req, res, next) {
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          res.clearCookie("token");
          res.clearCookie("refreshToken");
          res.status(200).json({
            message: "Logout successful"
          });

        case 3:
        case "end":
          return _context5.stop();
      }
    }
  });
});
module.exports = {
  signin: signin,
  changePassword: changePassword,
  verifyToken: verifyToken,
  refreshToken: refreshToken,
  logout: logout
};