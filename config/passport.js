const passport = require('passport');
const {User,ProviderAccount} = require('../database/models'); // adjust path


// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id, {
        include: [{
            model: ProviderAccount,
            as: 'providerAccounts',
        }]
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Load strategies
// require('./strategies/google/meta.strategy')(passport);
require('./../src/modules/Auth/passport/strategies/google.strategy')(passport);


module.exports = passport;
