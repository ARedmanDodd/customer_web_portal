const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../db/models/userSchema');
const localStrategy = require('passport-local');


// GET Requests
router.get('/', (req, res) => {
    res.locals.title = 'Home';
    console.log(req.user);
    res.render('base/index');
});

router.get('/login', (req, res) => {
    res.locals.title = 'Log In';
    res.render('base/login');
});

router.get('/redirect', (req, res) => {
    res.locals.title = 'Redirect';
    res.render('base/index');
});

router.get('/register', (req, res) => {
    res.locals.title = 'Register';
    res.render('base/register');
});

// POST Requests

router.post('/register', (req, res) => {
    User.register(new User({
        username: req.body.username.toLowerCase(),
        firstName: req.body.firstName.charAt(0).toUpperCase() + req.body.firstName.substr(1),
        surname: req.body.surname.charAt(0).toUpperCase() + req.body.surname.substr(1),
        email: req.body.email.toLowerCase()
    }), req.body.password, (err, user) => {
        if (err) {
            req.flash('fail', 'Failed Registration');
            return res.redirect('/register');
        }else{
            passport.authenticate('local')(req, res, () => {
                req.flash('success', `You are registered!`);
                res.redirect('/');
            });
        }
    });
});

router.post('/login', passport.authenticate('local', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/'
}), (req, res) => {
    
})

module.exports = router;