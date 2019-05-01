const express = require('express');
const router = express.Router();
const keys = require('../services/keys');
const Hrn = require('../db/models/hrnSchema');
const Faq = require('../db/models/faqSchema');
const User = require('../db/models/userSchema');

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.returnTo = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    req.flash('fail', 'You need to be logged into perform that request.');
    res.redirect(`${req.protocol}://${req.get('host')}/login`);
}

function isSuperUser(req, res, next){
    if(!req.user.isSuperUser){
        req.flash('fail', 'You do not have permission to access the administration area.');
        return res.redirect('/');
    }
    return next();
}

// GET Requests
router.get('/hrn', isLoggedIn, isSuperUser, (req, res) => {
    res.locals.title = 'HRN Number'
    return res.render('admin/hrn');
});

router.get('/faq/add', isLoggedIn, isSuperUser, (req, res) => {
    res.locals.title = 'Add FAQ';
    return res.render('admin/faq/add');
})

// POST Requests
router.post('/hrn/add', isLoggedIn, isSuperUser, (req, res) => {
    Hrn.findOne({
        $or: [
            { number: req.body.hrnNumber },
            {
                $and: [
                    { postcode: req.body.postcode },
                    { houseNumber: req.body.houseNumber }
                ]
            }
        ]
    }, (err, data) => {
        if (err) {
            req.flash('fail', keys.messages.dbError)
            console.log(err);
            return res.redirect('/admin/hrn');
        }
        if (data) {
            console.log(data);
        } else {
            Hrn.create({
                number: String(req.body.hrnNumber).replace(/ /g, '').toUpperCase(),
                houseNumber: String(req.body.houseNumber).replace(/ /g, ''),
                postcode: req.body.postCode.replace(/ /g, '').toUpperCase()
            }, (err, data) => {
                if (err) {
                    console.log(err);
                    req.flash('fail', keys.messages.dbError);
                    return res.redirect('/admin/hrn');
                }
                req.flash('success', 'New HRN Number successfully added.');
                return res.redirect('/admin/hrn');
            });
        }
    })
})

router.post('/faq/add', isLoggedIn, isSuperUser, (req, res) => {
    User.findById(req.user.id, (err, user) => {
        Faq.create({
            question: req.body.faqQ,
            answer: req.body.faqA,
            postedBy: [user],
            edits: [{
                date: Date.now(),
                q: req.body.faqQ,
                a: req.body.faqA,
                user: req.user
            }]
        }, (err, done) => {
            if(err){
                console.log(err);
                req.flash('fail', 'There was an error adding the FAQ');
                return res.redirect('/admin/faq/add');
            }else{
                req.flash('success', 'FAQ added successfully.');
                return res.redirect('/admin/faq/add');
            }
        })
    })
})

module.exports = router;