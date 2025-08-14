const passport = require('passport');
const AuthService = require('./AuthService');
const { User, Supplier, Customer } = require('../../database/models');

class AuthController {
  static login = async (req, res, next) => {
    passport.authenticate('user', async (err, user, info) => {
      if (err || !user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      if (user.status !== 'active' || !user.is_verified) {
        return res.status(401).json({ success: false, message: 'Account inactive or unverified' });
      }
      const deviceId = AuthService.generateDeviceId(user.contact, req.headers['user-agent']);
      const fullUser = await User.findByPk(user.id);


      const payload = { id: user.id, contact: user.contact, email: user.email};
      const token = AuthService.generateToken(payload);

      await AuthService.storeAccessToken(user.id, token, deviceId);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: { user: { ...fullUser.get({ plain: true }), token } }
      });
    })(req, res, next);
  };

  static verifyOtp = async (req, res) => {
    const { otp, contact } = req.body;
    const user = await User.findOne({ where: { contact }, include: ['supplier', 'customer'] });
    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    try {
      await AuthService.verifyOTP(user.id, otp);
      const type_id = user.supplier?.id || user.customer?.id || null;
      const token = AuthService.generateToken({ id: user.id, contact: user.contact, user_type: user.user_type, type_id }, '1d');

      await user.update({ is_verified: true, status: 'active' });

      return res.json({ success: true, message: 'OTP verified', data: { token, user } });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };

  static forgotPassword = async (req, res) => {
    const { contact } = req.body;
    const user = await User.findOne({ where: { contact } });
    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    const { otp } = await AuthService.generateAndSaveOTP(user.id);
    // You can send the OTP via SMS/Email here
    return res.json({ success: true, message: 'OTP sent', data: { contact, otp } });
  };

  static resetPassword = async (req, res) => {
    const { contact, password } = req.body;
    const user = await User.findOne({ where: { contact } });
    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    const hashed = await AuthService.hashPassword(password);
    await user.update({ password: hashed });
    return res.json({ success: true, message: 'Password reset' });
  };

  static logout = async (req, res) => {
    const user = await require('../../../helper/common').authUser(req);
    const deviceId = AuthService.generateDeviceId(user.contact, req.headers['user-agent']);

    await AccessToken.destroy({ where: { user_id: user.id, device_id: deviceId } });

    if (req.session) {
      req.session.destroy(() => res.json({ success: true, message: "Logged out" }));
    } else {
      res.json({ success: true, message: "Logged out" });
    }
  };
}

module.exports = AuthController;
