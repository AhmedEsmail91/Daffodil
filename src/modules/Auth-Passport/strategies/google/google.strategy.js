const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { User, ProviderAccount,Role } = require('../../../../../database/models'); // adjust path
const getRole = async (roleName) => {
  const role = await Role.findOne({ where: { name_en: roleName } });
  return role ? role.id : null;
};
module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true
      },
      async (req,accessToken, refreshToken, profile, done) => {
        try {
          console.log("🔹 Google profile received:", profile.id, profile.displayName);

          // Try to find the provider account
          let providerAccount = await ProviderAccount.findOne({
            where: {
              provider: 'google',
              providerUserId: profile.id
            },
            include: [{ model: User, as: 'user' , include: [{ model: Role, as: 'role' }] }]
          });

          let user;
          if (providerAccount && providerAccount.user) {
            console.log("✅ Found existing provider account and user");
            user = providerAccount.user;
          } else {
            console.log("ℹ️ No provider account found, creating new user + provider account");
            const role_id=await getRole('user')
            user = await User.create({
              name: profile.displayName,
              preferred_lang: profile._json.locale || 'en',
              email: profile.emails?.[0]?.value,
              role_id
            });


            providerAccount = await ProviderAccount.create({
              user_id: user.id,
              provider: 'google',
              providerUserId: profile.id,
              accessToken,
              refreshToken,
              profileJson: profile._json
            });
          }
          return done(null, user);
        } catch (err) {
          console.error("❌ Error in Google strategy:", err);
          return done(err, null);
        }
      }
    )
  );
};
