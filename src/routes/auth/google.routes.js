const express = require('express');
const passport = require('../../../config/passport.js');
const jwt = require('jsonwebtoken')
const router = express.Router();

// Google OAuth
router.get('/doctor/', passport.authenticate('google', {
  scope: [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar'
  ],
  accessType: 'offline',
  prompt: 'consent',
  state: 'doctor'
}));
router.get('/patient/', passport.authenticate('google', {
  scope: [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ],
  accessType: 'offline',
  prompt: 'consent',
  state: 'user'
}));

router.get(
  '/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    
    let redirectUrl;
    if (req?.query?.state === 'doctor') {
      redirectUrl = process.env.OPERATORS_FRONTEND_BASE_URL || 'http://localhost:8080';
    } else if (req?.query?.state === 'user') {
      redirectUrl = process.env.FRONT_BASE_URL || 'http://localhost:5173'; 
      // or whatever your patient app runs on
    } else {
      redirectUrl = process.env.FRONT_BASE_URL || 'http://localhost:5173';
    }
    const payload = {
      user_id: req.user.id,
      username: req.user.username,
      role: {
        id: req.user.role.id,
        name: req.user.role.name_en,
      },
      email: req.user.email,
      lang: req.user.preferred_lang || 'en'
    };

    const secret = Buffer.from(process.env.JWT_SECRET_KEY, 'base64');
    const token = jwt.sign(payload, secret, {
      expiresIn: process.env.JWT_EXPIRATION,
    });
    res.cookie("token", token, {
    httpOnly: true,
    secure: true,     // HTTPS only in production
    sameSite: "lax",  // or "strict" depending on UX
    maxAge: 60 * 60 * 1000,
  });

    // Redirect without exposing the token
    res.redirect(redirectUrl);
    // ✅ redirect back to frontend with token
    // const frontendUrl = `${process.env.FRONT_BASE_URL}/auth/callback`;
    // res.redirect(frontendUrl);
  }
);


module.exports = router;