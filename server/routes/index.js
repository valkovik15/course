var express = require('express');
var router = express.Router();
var passport = require('passport');
// get gravatar icon from email
var gravatar = require('gravatar');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express from server folder' });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Login Page', message: req.flash('loginMessage') });
});
/* POST login */
router.post('/login', passport.authenticate('local-login', {
    //Success go to Profile Page / Fail go to login page
    successRedirect : '/profile',
    failureRedirect : '/login',
    failureFlash : true
}));

/* GET Signup */
router.get('/signup', function(req, res) {
    res.render('signup', { title: 'Signup Page', message: req.flash('signupMessage') });
});
/* POST Signup */
router.post('/signup', passport.authenticate('local-signup', {
    //Success go to Profile Page / Fail go to Signup page
    successRedirect : '/profile',
    failureRedirect : '/signup',
    failureFlash : true
}));
router.get('/auth/facebook', passport.authenticate('facebook', {
      scope : ['public_profile', 'email']
    }));

    // handle the callback after facebook has authenticated the user
  router.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

/* GET Profile page. */
router.get('/profile', isLoggedIn, function(req, res, next) {
  console.log(req.user);
  if(req.user.pic!=null)
    res.render('profile', { title: 'Profile Page', user : req.user, avatar:req.user.facebook.pic });
else {
      res.render('profile', { title: 'Profile Page', user : req.user, avatar:gravatar.url(req.user.email ,  {s: '100', r: 'x', d: 'retro'}, true) });
}});

/* check if user is logged in */
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}
/* GET Logout Page */
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
