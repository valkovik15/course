// load passport module
var bCrypt = require('bcrypt-nodejs');
var LocalStrategy    = require('passport-local').Strategy;
  var FacebookStrategy = require('passport-facebook').Strategy;
// load up the user model
var configAuth = require('./auth');

module.exports = function(passport, user) {
    console.log(user);
    var User=user;
    // passport init setup
    // serialize the user for the session

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });


    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id).then(function(user) {
            if(user){
                done(null, user.get());
            }
            else{
                done(user,null);
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


        function(req, email, password, done) {

            var User = user;

            var isValidPassword = function(userpass, password) {

                return bCrypt.compareSync(password, userpass);

            }

            User.findOne({
                where: {
                    email: email
                }
            }).then(function(user) {

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


            }).catch(function(err) {

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
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },


        function(req, email, password, done) {

            var generateHash = function(password) {

                return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);

            };



            User.findOne({
                where: {
                    email: email
                }
            }).then(function(user) {

                if (user)

                {

                    return done(null, false, {
                        message: 'That email is already taken'
                    });

                } else

                {

                    var userPassword = generateHash(password);

                    var data =

                        {
                            email: email,

                            password: userPassword,

                            name:req.body.name

                        };

                    User.create(data).then(function(newUser, created) {

                        if (!newUser) {

                            return done(null, false);

                        }

                        if (newUser) {

                            return done(null, newUser);

                        }

                    });

                }

            });

        }

    ));
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
           User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

               // if there is an error, stop everything and return that
               // ie an error connecting to the database
               if (err)
               {if(err.oauthError)
                 {
                        var oauthError = JSON.parse(err.oauthError.data);
                        res.send(oauthError.error.message);
                    } else {return done(err);}
                  }


               // if the user is found, then log them in
               if (user) {
                   return done(null, user); // user found, return that user
               } else {
                   // if there is no user found with that facebook id, create them
                   var newUser=new User();

                   // set all of the facebook information in our user model
                   newUser.facebook.id    = profile.id; // set the users facebook id
                   newUser.facebook.token = token; // we will save the token that facebook provides to the user
                   newUser.local.name=newUser.facebook.name  = profile.displayName; // look at the passport user profile to see how names are returned
                  newUser.facebook.pic=profile.photos[0].value;
                  console.log(profile);
                  if(profile.emails!=null)
                  {
                   newUser.local.email=newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
}
                   // save our user to the database
                   newUser.save(function(err) {
                       if (err)
                           throw err;

                       // if successful, return the new user
                       return done(null, newUser);
                   });
               }
             });
      });

  }));

};
