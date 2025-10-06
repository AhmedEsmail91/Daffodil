"use strict";

var express = require('express');

var passport = require('../../../config/passport.js');

var jwt = require('jsonwebtoken');

var router = express.Router(); // Google OAuth

router.get('/doctor/', passport.authenticate('google', {
  scope: ['openid', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/calendar'],
  accessType: 'offline',
  prompt: 'consent',
  state: 'doctor'
}));
router.get('/patient/', passport.authenticate('google', {
  scope: ['openid', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
  accessType: 'offline',
  prompt: 'consent',
  state: 'user'
}));
router.get('/callback', passport.authenticate('google', {
  session: false,
  failureRedirect: '/login'
}), function (req, res) {
  var payload = {
    user_id: req.user.id,
    role_id: req.user.role_id,
    username: req.user.username,
    email: req.user.email
  };
  var secret = Buffer.from(process.env.JWT_SECRET_KEY, 'base64');
  var token = jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRATION
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    // HTTPS only in production
    sameSite: "lax",
    // or "strict" depending on UX
    maxAge: 60 * 60 * 1000
  }); // Redirect without exposing the token

  res.redirect("http://localhost:8080/"); // ✅ redirect back to frontend with token
  // const frontendUrl = `${process.env.FRONT_BASE_URL}/auth/callback`;
  // res.redirect(frontendUrl);
});
module.exports = router;