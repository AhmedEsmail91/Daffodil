const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { User, ProviderAccount,Role,Doctor } = require('../../../../../database/models'); // adjust path
const { sendApologize, sendInitialPassword}=require('../../../../services/emails/sender-config/sendEmail.js')
const crypto=require('crypto')
const AppError=require('../../../../../utils/errors/AppError.js')
const getRole = async (roleName) => {
  const role = await Role.findOne({ where: { name_en: roleName } });
  return role ? role.id : null;
};

async function handleGoogleAuth(req, accessToken, refreshToken, profile) {
  const { state } = req.query;
  if (!['doctor', 'user'].includes(state)) {
    throw new Error('Invalid state parameter');
  }

  let providerAccount = await ProviderAccount.findOne({
    where: { provider: 'google', providerUserId: profile.id },
    include: [
      {
        model: User,
        as: 'user',
        include: [{
          model: Role,
          as: 'role'
        }, {
          model: Doctor,
          as: 'doctor'
        }]
      }
    ]
  });

  let user;
  if (providerAccount && providerAccount.user) {
    user = providerAccount.user;

    // 🚨 Prevent doctor from logging in as user and vice versa
    const roleName = user.role?.name_en;
    if (state !== roleName) {
      throw new AppError(`You are registered as a ${roleName} not as a ${state}`, 403);
    }
  } else {
    const role_id = await getRole(state);
    const init_password = crypto.randomBytes(8).toString('hex') + "QW$";

    user = await User.create({
      username: profile.displayName,
      preferred_lang: profile._json.locale || 'en',
      email: profile.emails?.[0]?.value,
      role_id,
      password: init_password
    });

    if (state === 'doctor') {
      await Doctor.findOrCreate({
        where: { user_id: user.id },
        defaults: { approved: false,name_en:profile.displayName }
      });
    }

    await ProviderAccount.create({
      user_id: user.id,
      provider: 'google',
      providerUserId: profile.id,
      accessToken,
      refreshToken,
      profileJson: profile._json
    });

    await sendInitialPassword(user.email, user.username, init_password, process.env.AUTH_URL, user.preferred_lang);

    // reload with role & doctor info
    user = await User.findByPk(user.id, {
      include: [{ model: Role, as: 'role' }, { model: Doctor, as: 'doctor' }]
    });
    console.log("New user created via Google OAuth:", user.email, "with state:", state,"and role:", user.role?.name_en);
  }

  return user;
}

module.exports = (passport) => {
  const strategyObject={
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true
      }
  passport.use(
    new GoogleStrategy(
      strategyObject,
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const user = await handleGoogleAuth(req, accessToken, refreshToken, profile);
          // console.log(JSON.stringify(profile))
          if(req.query.state === 'doctor' && user.doctor?.approved === false){
            // done (err, user, object)
            return done(new AppError('Your account is pending approval by the admin.',401), null);
          }
          return done(null, user);
        } catch (err) {
          console.error("❌ Error in Google strategy");
          return done(err, null);
        }
      }
    )
  );
};
