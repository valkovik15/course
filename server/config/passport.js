// load passport module
var bCrypt = require('bcrypt-nodejs');
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
const VKontakteStrategy = require('passport-vkontakte').Strategy;
// load up the user model
var configAuth = require('./auth');

module.exports = function(passport, user) {
    console.log(user);
    var User = user;

    // passport init setup
    // serialize the user for the session

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });


    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id).then(function (user) {
            if (user) {
                done(null, user.get());
            }
            else {
                done(user, null);
            }
        });

    });
    // using local strategy
    passport.use('local-login', new LocalStrategy(
        {

            // by default, local strategy uses username and password, we will override with email

            usernameField: 'email',

            passwordField: 'password',

            passReqToCallback: true // allows us to pass back the entire request to the callback

        },


        function (req, email, password, done) {

            var User = user;

            var isValidPassword = function (userpass, password) {

                return bCrypt.compareSync(password, userpass);

            }

            User.findOne({
                where: {
                    email: email,
                    isActive:true
                }
            }).then(function (user) {

                if (!user) {

                    return done(null, false, {
                        message: 'Email does not exist'
                    });

                }

                if (!isValidPassword(user.password, password)) {

                    return done(null, false, {
                        message: 'Incorrect password.'
                    });

                }


                var userinfo = user.get();
                return done(null, userinfo);


            }).catch(function (err) {

                console.log("Error:", err);

                return done(null, false, {
                    message: 'Something went wrong with your Signin'
                });

            });


        }
    ));
    // Signup local strategy
    passport.use('local-signup', new LocalStrategy({
            // change default username and password, to email and password
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {
            var generateHash = function (password) {
                return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
            };
            User.findOne({
                where: {
                    email: email
                }
            }).then(function (user) {
                if (user) {
                    return done(null, false, {
                        message: 'That email is already taken'
                    });
                } else
                    var userPassword = generateHash(password);
                var data =
                    {
                        email: email,
                        password: userPassword,
                        name: req.body.name,
                        role: 'user', isActive:true
                    };
                User.create(data).then(function (newUser, created) {
                    if (!newUser) {
                        return done(null, false);
                    }
                    if (newUser) {
                        return done(null, newUser);
                    }
                });
            })
        }));


    passport.use(new FacebookStrategy({

            // pull in our app id and secret from our auth.js file
            clientID        : configAuth.facebookAuth.clientID,
            clientSecret    : configAuth.facebookAuth.clientSecret,
            callbackURL     : configAuth.facebookAuth.callbackURL,
            profileFields:['id', 'displayName', 'photos', 'emails']
        },

        // facebook will send back the token and profile
        function(token, refreshToken, profile, done) {
          // asynchronous
            process.nextTick(function() {

                // find the user in the database based on their facebook id
                User.findOne({where: { email :  profile.emails[0].value }}).then( user=> {
                    console.log(profile);
                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database


                    // if the user is found, then log them in

                    if (user) {
                        console.log('Hey');
                        if(user.isActive) {
                            return done(null, user); // user found, return that user
                        }
                        else
                        {
                            return done(null, false);
                        }
                    } else {
                        var data = {
                            email:profile.emails[0].value,
                            pic: profile.photos[0].value,
                            name: profile.displayName,
                            password:null,
                             role:'user', isActive:true, locale:"en-US"
                        };
                        console.log('data');
                        console.log(data);
                        User.create(data).then(function(newUser, created) {

                            if (!newUser) {
                                console.log('What');
                                return done(null, false);

                            }

                            if (newUser) {
                                console.log('okey');
                                return done(null, newUser);

                            }

                        });
                        // if there is no user found with that facebook id, create them

                        console.log(profile);
                        // save our user to the database
                    }
                });
            });

        }));
    passport.use(new VKontakteStrategy(
        {
            clientID:     6673517, // VK.com docs call it 'API ID', 'app_id', 'api_id', 'client_id' or 'apiId'
            clientSecret: 'acs5JMSdQMHa82gyh9Jz',
            callbackURL:  "http://localhost:3000/auth/vkontakte/callback"
        },
        function myVerifyCallbackFn(accessToken, refreshToken, params, profile, done) {
            process.nextTick(function() {

                // find the user in the database based on their facebook id
                User.findOne({where: { email :  params.email }}).then( user=> {
                    console.log(profile);
                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database


                    // if the user is found, then log them in
                    if (user) {
                        console.log('Hey');
                        if(user.isActive) {
                            return done(null, user); // user found, return that user
                        }
                        else
                        {
                            return done(null, false);
                        }
                    } else {
                        var data = {
                            email:params.email,
                            pic: profile.photos[0].value,
                            name: profile.displayName,
                            password:null,
                            role:'user', isActive:true, locale:"en-US"
                        };
                        console.log('data');
                        console.log(data);
                        User.create(data).then(function(newUser, created) {

                            if (!newUser) {
                                console.log('What');
                                return done(null, false);

                            }

                            if (newUser) {
                                console.log('okey');
                                return done(null, newUser);

                            }

                        });
                        // if there is no user found with that facebook id, create them

                        console.log(profile);
                        // save our user to the database
                    }
                });
            // Now that we have user's `profile` as seen by VK, we can
            // use it to find corresponding database records on our side.
            // Also we have user's `params` that contains email address (if set in
            // scope), token lifetime, etc.
            // Here, we have a hypothetical `User` class which does what it says.
            console.log(params);
            console.log(profile);
        });

}));
};
