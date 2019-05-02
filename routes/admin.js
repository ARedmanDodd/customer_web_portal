const express = require('express');
const router = express.Router();
const keys = require('../services/keys');
const Hrn = require('../db/models/hrnSchema');
const Faq = require('../db/models/faqSchema');
const User = require('../db/models/userSchema');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const mongoose = require('mongoose');

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.returnTo = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    req.flash('fail', 'You need to be logged into perform that request.');
    res.redirect(`${req.protocol}://${req.get('host')}/login`);
}

function isSuperUser(req, res, next) {
    if (!req.user.isSuperUser) {
        req.flash('fail', 'You do not have permission to access the administration area.');
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

let conn = mongoose.createConnection(keys.database.uri, {
    useNewUrlParser: true,
    useCreateIndex: true
});
let gfs;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('guideUploads');
});

const storage = new GridFsStorage({
    url: keys.database.uri,
    options: {
        useNewUrlParser: true
    },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) return reject(err);
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileinfo = {
                    filename: filename,
                    bucketName: 'guideUploads',
                    metadata: { 'displayName': file.originalname, 'title': req.body.gTitle, 'description': req.body.fileDescription, 'guide': req.body.guide, 'user': req.user }
                };
                resolve(fileinfo);
            })
        })
    }
});

const upload = multer({
    storage
});

// GET Requests
router.get('/hrn', isLoggedIn, isSuperUser, (req, res) => {
    res.locals.title = 'HRN Number'
    return res.render('admin/hrn');
});

router.get('/faq/add', isLoggedIn, isSuperUser, (req, res) => {
    res.locals.title = 'Add FAQ';
    return res.render('admin/faq/add');
})

router.get('/faq/edit/:id', isLoggedIn, isSuperUser, (req, res) => {
    Faq.findById(req.params.id, (err, faq) => {
        if (err) error(req, res);
        return res.render('admin/faq/edit', { faqE: faq });
    })
})

router.get('/guide/add', isLoggedIn, isSuperUser, (req, res) => {
    res.render('admin/self-help/add.ejs');
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
        if (err) error(req, res)
        if (data) {
            console.log(data);
        } else {
            Hrn.create({
                number: String(req.body.hrnNumber).replace(/ /g, '').toUpperCase(),
                houseNumber: String(req.body.houseNumber).replace(/ /g, ''),
                postcode: req.body.postCode.replace(/ /g, '').toUpperCase()
            }, (err, data) => {
                if (err) error(req, res)
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
            video: req.body.faqV,
            edits: [{
                date: Date.now(),
                q: req.body.faqQ,
                a: req.sanitize(req.body.faqA),
                user: req.user,
                v: req.body.faqV
            }],
        }, (err, done) => {
            if (err) error(req, res)
            req.flash('success', 'FAQ added successfully.');
            return res.redirect('/admin/faq/add');
        })
    })
})

router.post('/faq/edit/:id', isLoggedIn, isSuperUser, (req, res) => {
    Faq.findById(req.params.id, (err, faq) => {
        if (err) error(req, res)
        faq.question = req.body.faqQ;
        faq.answer = req.sanitize(req.body.faqA);
        faq.video = req.body.faqV;
        faq.edits.push({
            date: Date.now(),
            q: req.body.faqQ,
            a: req.sanitize(req.body.faqA),
            user: req.user,
            v: req.body.faqV
        })
        faq.save((err, done) => {
            if (err) error(req, res)
            req.flash('success', 'FAQ successfully updated.');
            return res.redirect(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        })
    })
})

router.post('/guide/add', isLoggedIn, isSuperUser, upload.single('upload'), (req, res) => {
    console.log(req.body);
    req.flash('success', `${req.body.gTitle} successfully uploaded`);
    return res.redirect(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
})

module.exports = router;