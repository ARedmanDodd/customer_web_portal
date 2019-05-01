const express = require('express');
const router = express.Router();
const User = require('../db/models/userSchema');
const Keys = require('../services/keys');
const FAQ = require('../db/models/faqSchema');


// GET Requests
router.get('/', (req, res) => {
    FAQ.find({}, (err, faq) => {
        if(err){
            console.log(err);
            req.flash('fail', Keys.messages.dbError);
            return res.redirect('/');
        }
        return res.render('help/index', {faq: faq});
    });
});

// POST Requests


module.exports= router;