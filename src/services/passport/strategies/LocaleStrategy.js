module.exports = (passport) => {
    passport.use('user', new LocalStrategy({
        usernameField: 'contact', // the identifier for the user email/contact
        passReqToCallback: true // allows us to pass the request object to the callback
    }, async (req, contact, password, done) => {
        try {
            const user = await User.findOne({
                where: {
                    contact,
                    status: 'active'
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
                return done(null, user); // User authenticated successfully and returned in the done callback which can be accessed in the route handler
            } else {
                return done(null, false, {
                    message: 'Invalid password.'
                });
            }

        } catch (error) {
            return done(error);
        }
    }));
}