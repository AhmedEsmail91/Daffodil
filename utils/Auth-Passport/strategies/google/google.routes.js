const express = require('express');
const passport = require('../../passport.config');
const bcrypt = require('bcrypt');
const { User, ProviderAccount } = require('../../../../../database/models');
const jwt=require('jsonwebtoken')
const router = express.Router();

// Google OAuth
router.get('/', passport.authenticate('google', {
    scope: [
      'openid',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/calendar'
    ],
    accessType: 'offline',
    prompt: 'consent'
  }));

const signToken = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error("No user found on request — Passport authentication might have failed.");
    }

    const payload = {
      user_id: req.user.id,
      email: req.user.email
    };
    const secret = Buffer.from(process.env.JWT_SECRET_KEY, 'base64');
    const token = jwt.sign(payload, secret, {
      expiresIn: process.env.JWT_EXPIRATION
    });

    res.status(200).json({ token });
  } catch (err) {
    console.error(err.message || "signToken Error");
    res.status(500).json({ error: err.message || 'Something went wrong' });
  }
};

router.get('/callback',
  passport.authenticate('google', {failureRedirect: '/login-fail',session:false }),
  signToken
);

module.exports = router;
