const express = require('express'),
    path = require('path'),
    router = express.Router(),
    multer = require('multer'),
    crypto = require('crypto'),
    mongoose = require('mongoose'),
    Grid = require('gridfs-stream'),
    keys = require('../services/keys'),
    Faq = require('../db/models/faqSchema'),
    Hrn = require('../db/models/hrnSchema'),
    User = require('../db/models/userSchema'),
    selfHelp = require('../db/models/selfHelp'),
    GridFsStorage = require('multer-gridfs-storage');

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
    useCreateIndex: true,
    useFindAndModify: false
});
let gfs;
let gfsClient;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('guideUploads');
    gfsClient = Grid(conn.db, mongoose.mongo);
    gfsClient.collection('logoUploads');
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
                    metadata: { 'displayName': file.originalname, 'title': req.body.gTitle || req.body.gTitleEdit, 'description': req.body.fileDescription || req.body.fileDescriptionEdit, 'guide': req.body.guide, 'user': req.user, 'uuid': `${file.originalname}${Date.now()}`, 'enabled': false }
                };
                resolve(fileinfo);
            })
        })
    }
});

const logoStorage = new GridFsStorage({
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
                    bucketName: 'logoUploads',
                    metadata: { 'displayName': file.originalname}
                };
                resolve(fileinfo);
            })
        })
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (path.extname(file.originalname) !== '.pdf') {
            return cb(new Error('Only pdfs are allowed'))
        }
        cb(null, true)
    }
}).single('upload');

const logoUpload = multer({
    storage: logoStorage,
    fileFilter: function (req, file, cb) {
        if (path.extname(file.originalname) !== '.jpg' || '.png') {
            return cb(new Error('Only image files are allowed'))
        }
        cb(null, true)
    }
}).single('upload');

// GET Requests
router.get('/', isLoggedIn, isSuperUser, (req, res) => {
    Faq.find({}, (err, faq) => {
        if (err) error();
        selfHelp.find({}, (err, guide) => {
            if (err) error();
            gfs.files.find({}).toArray((err, files) => {
                if (err) error();
                res.locals.title = 'Site Admin';
                return res.render('admin/index', { faq: faq, guide: guide, files: files });
            })
        })
    });
});

router.get('/faq/delete/:id', isLoggedIn, isSuperUser, (req, res) => {
    Faq.findByIdAndDelete(req.params.id, (err, data) => {
        if (err) error();
        return res.redirect('/admin#faq-section');
    })
});

router.get('/guide/upload/toggle/:id', isLoggedIn, isSuperUser, (req, res) => {
    gfs.files.findOne({ 'metadata.uuid': req.params.id }, (err, guide) => {
        if (err) error();
        if (guide.metadata.enabled) {
            gfs.files.updateOne({ '_id': guide._id }, { '$set': { 'metadata.enabled': false } });
            return res.redirect('/admin#guide-section');
        } else {
            gfs.files.updateOne({ '_id': guide._id }, { '$set': { 'metadata.enabled': true } });
            return res.redirect('/admin#guide-section');
        }
    });
});

router.get('/guide/written/toggle/:id', isLoggedIn, isSuperUser, (req, res) => {
    selfHelp.findOne({ "_id": req.params.id }, (err, guide) => {
        if (err) error();
        if (guide.enabled) {
            selfHelp.findByIdAndUpdate(req.params.id, { enabled: false }, (err, data) => {
                if (err) error();
                return res.redirect('/admin#guide-section');
            });
        } else {
            selfHelp.findByIdAndUpdate(req.params.id, { enabled: true }, (err, data) => {
                if (err) error();
                return res.redirect('/admin#guide-section');
            });
        }
    });
});

router.get('/guide/upload/delete/:id', isLoggedIn, isSuperUser, (req, res) => {
    gfs.remove({ _id: req.params.id, root: 'guideUploads' }, (err, data) => {
        if (err) console.log(err);
        return res.redirect('/admin#guide-section');
    })
});

router.get('/guide/written/delete/:id', isLoggedIn, isSuperUser, (req, res) => {
    selfHelp.findByIdAndRemove(req.params.id, (err, data) => {
        if (err) error();
        return res.redirect('/admin#guide-section');
    })
});

// POST Requests

router.post('/faq/add', isLoggedIn, isSuperUser, (req, res) => {
    User.findById(req.user.id, (err, user) => {
        Faq.create({
            question: req.body.faqQ,
            answer: req.body.faqA,
            postedBy: [user],
            video: req.body.video.replace(/watch\?v=/gi, "embed/"),
            edits: [{
                date: Date.now(),
                q: req.body.faqQ,
                a: req.sanitize(req.body.faqA),
                user: req.user,
                v: req.body.video.replace(/watch\?v=/gi, "embed/")
            }],
        }, (err, done) => {
            if (err) error(req, res)
            req.flash('success', 'FAQ added successfully.');
            return res.redirect('/admin#faq-section');
        })
    })
});

router.post('/faq/edit/:id', isLoggedIn, isSuperUser, (req, res) => {
    Faq.findById(req.params.id, (err, faq) => {
        if (err) error(req, res)
        faq.question = req.body.faqQ;
        faq.answer = req.sanitize(req.body.faqA);
        faq.video = req.body.faqV.replace(/watch\?v=/gi, "embed/");
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
            return res.redirect(`/admin#faq-section`);
        })
    })
});

router.post('/guide/add', isLoggedIn, isSuperUser, (req, res) => {
    upload(req, res, err => {
        if (err) {
            req.flash('fail', 'Only .pdf files are allowed.');
            return res.redirect(`/admin#guide-section`);
        }
        if (req.body.fileUpload == 'false') {
            selfHelp.create({
                title: req.body.gTitle,
                guide: req.sanitize(req.body.guide),
                description: req.body.fileDescription
            }, (err, guide) => {
                if (err) error();
                req.flash('success', `${req.body.gTitle} Has been created.`);
                return res.redirect(`/admin#guide-section`);
            })
        } else {
            req.flash('success', `${req.body.gTitle} has been uploaded`);
            return res.redirect(`/admin#guide-section`);
        }
    });
});

router.post('/guide/edit/:id', isLoggedIn, isSuperUser, (req, res) => {
    upload(req, res, err => {
        if (err) {
            req.flash('fail', 'Only .pdf files are allowed.');
            return res.redirect(`/admin#guide-section`);
        }
        if (req.body.fileUploadEdit == 'false') {
            selfHelp.findById(req.params.id, (err, help) => {
                if (err) error();
                help.title = req.body.gTitleEdit;
                help.guide = req.body.guide;
                help.description = req.body.fileDescriptionEdit;
                help.save((err, done) => {
                    if (err) error();
                    req.flash('success', 'Guide successfully updated.');
                    return res.redirect('/admin#guide-section');
                })
            })
        } else {
            selfHelp.findByIdAndDelete(req.params.id, (err, done) => {
                if (err) error();
                req.flash('success', `${req.body.gTitle} has been uploaded`);
                return res.redirect(`/admin#guide-section`)
            })
        }
    });
});

router.post('/guide/upload/edit/:id', isLoggedIn, isSuperUser, (req, res) => {
    upload(req, res, err => {
        if (err) {
            req.flash('fail', 'Only .pdf files are allowed.');
            return res.redirect(`/admin#guide-section`);
        }
        gfs.remove({_id : req.params.id, root: 'guideUploads'}, (data) => {
            req.flash('success', `${req.body.gTitle} has been uploaded`);
            return res.redirect(`/admin#guide-section`);
        });
    });
});

router.post('/client/new', isLoggedIn, isSuperUser, (req, res) => {
    logoUpload(req, res, err => {
        if (err) {
            req.flash('fail', 'Only image files are allowed.');
            return res.redirect(`/admin`);
        }
        //Handle remaining body
    });
});

module.exports = router;