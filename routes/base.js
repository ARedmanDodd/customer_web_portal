const express = require('express');
const router = express.Router();
const passport = require('passport');
const keys = require('../services/keys');
const User = require('../db/models/userSchema');
const Hrn = require('../db/models/hrnSchema');
const localStrategy = require('passport-local');

/**
 * 
 * @param {*} err The error returned
 * @param {String} url The URL to redirect to
 * @param {Object} req The request
 * @param {*} res The Resolution
 * @param {Boolean} log Log the error to the console
 */
function error(err, url, req, res, log) {
    req.flash('fail', keys.messages.dbError);
    if (log) console.log(err);
    return res.redirect(url);
}

/**
 * 
 * @param {Object} user The user returned from mongodb
 * @param {Object} hrn The HRN number returned from mongodb
 * @param {Object} req The request
 * @param {*} res The resolution
 */
function registerDataCheck(user, hrn, req, res) {
    let value;
    for (key in req.body.signup) {
        value = req.body.signup[key];
        res.locals.validation[key] = value;
        if (req.body.signup.password !== req.body.signup.confirm_password) {
            res.locals.validation[`${key}invalid`] = 1;
            res.locals.validation['error'] = true;
        }
        if (!hrn) continue;
        switch (key) {
            case 'HRN_Number': {
                if (hrn.number === String(req.body.signup.HRN_Number).replace(/ /g, '').toLocaleUpperCase()) {
                    if(hrn.active){
                        res.locals.validation[`${key}invalid`] = 1;
                        res.locals.validation['error'] = true;
                        continue;
                    }
                }
                break;
            }
            case 'hnumber': {
                if (hrn.houseNumber !== String(req.body.signup.hnumber)) {
                    res.locals.validation[`${key}invalid`] = 1;
                    res.locals.validation['error'] = true;
                    continue;
                }
                break;
            }
            case 'postcode': {
                if (hrn.postcode !== req.body.signup.postcode.replace(/ /g, '')) {
                    res.locals.validation[`${key}invalid`] = 1;
                    res.locals.validation.error = true;
                    continue;
                }
                break;
            }
        }
        if (!user) continue;
        if (user[key] === req.body.signup[key]) {
            res.locals.validation[`${key}invalid`] = 1;
            res.locals.validation['error'] = true;
        }
    }
    if (res.locals.validation.error){
        return true;
    }else{
        return false;
    }
}

// GET Requests
router.get('/', (req, res) => {
    res.locals.title = 'Home';
    res.render('base/index');
});

router.get('/register', (req, res) => {
    res.locals.title = 'Register';
    res.render('base/register');
});

router.get('/login', (req, res) => {
    res.locals.title = 'Log In';
    res.render('base/login');
})

router.get('/logout', (req, res) => {
    res.locals.title = 'Logout';
    req.logout();
    res.redirect('/');
})

// POST Requests

router.post('/register', (req, res) => {
    Hrn.findOne({ number: req.body.signup.HRN_Number }, (err, hrn) => {
        if (err) error(err, '/register', req, res, false);
        User.findOne({
            $or: [
                { username: req.body.signup.username },
                { email: req.body.signup.email }
            ]
        }, (err, user) => {
            if (err) error(err, '/register', req, res, false);
            if (user || hrn) {
                if (registerDataCheck(user, hrn, req, res)){
                    return res.render('base/register', { fail: 'Errors were found in the details that you provided. Please check and try again.' });
                }else{
                    User.register(new User({
                        HRN_Number: req.body.signup.HRN_Number,
                        username: req.body.signup.username.toLowerCase(),
                        firstName: req.body.signup.firstName.charAt(0).toUpperCase() + req.body.signup.firstName.substr(1),
                        surname: req.body.signup.surname.charAt(0).toUpperCase() + req.body.signup.surname.substr(1),
                        email: req.body.signup.email.toLowerCase(),
                        activeHRN: hrn
                    }), req.body.signup.password, (err, user) => {
                        if (err) error(err, '/register', req, res);
                        hrn.users.push(user);
                        hrn.save((err, done) => {
                            if (err) error(err, '/register', req, res);
                            req.flash('success', 'Registartion successful.');
                            return res.redirect('/');
                        })
                    });
                }
            }else if(!hrn){
                return res.render('base/register', { fail: `The HRN Number that you provided is not vaild.` });
            }
        });
    })
});

router.post('/login', passport.authenticate('local', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/'
}), (req, res) => {
});

module.exports = router;