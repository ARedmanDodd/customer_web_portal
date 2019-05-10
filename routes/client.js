const express = require('express'),
    router = express.Router(),
    keys = require('../services/keys'),
    User = require('../db/models/userSchema'),
    Client = require('../db/models/clientSchema');

router.use((req, res, next) => {
    Client.findById(res.locals.user.clientID, (err, client) => {
        if (err) {
            next();
        } else {
            res.locals.client = client
            next();
        }
    })
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.returnTo = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    req.flash('fail', 'You need to be logged into perform that request.');
    res.redirect(`${req.protocol}://${req.get('host')}/login`);
}

function isClientAdmin(req, res, next) {
    if (!req.user.isClientAdmin) {
        req.flash('fail', 'You do not have permission to access this area.');
        return res.redirect('/');
    }
    return next();
}

function isSuperUser(req, res, next) {
    if (!req.user.isSuperUser) {
        req.flash('fail', 'You do not have permission to access this area.');
        return res.redirect('/');
    }
    return next();
}

/**
 * 
 * @param {*} req Express Request
 * @param {*} res Express Response
 */
function error(req, res) {
    console.log(err);
    req.flash('fail', keys.messages.dbError);
    return res.redirect(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
}

// GET Requests

router.get('/', isLoggedIn, isClientAdmin, (req, res) => {
    res.render('client/index')
})

// POST Requests


module.exports = router;