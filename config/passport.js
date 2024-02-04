const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./../model/user'); // Assuming this is your Mongoose User model

module.exports = function () {
  passport.use(new GoogleStrategy({
    clientID: 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: 'http://localhost:3000/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const existingUser = await User.findOne({ googleId: profile.id });

      if (existingUser) {
        return done(null, existingUser);
      }

      const username = profile.displayName.split(' ');
      const newUser = new User({
        name: profile.displayName,
        username: username[0],
        password: username[0], // You may want to handle this differently
        facebookId: '',
        googleId: profile.id,
      });

      // Save the new user to the database
      await newUser.save();

      return done(null, newUser);
    } catch (error) {
      return done(error, false, { message: error.message });
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, false, { message: error.message });
    }
  });
};

