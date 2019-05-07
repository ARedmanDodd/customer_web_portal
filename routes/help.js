const express = require('express');
const router = express.Router();
const keys = require('../services/keys');
const pdf = require('html-pdf');
const selfHelp = require('../db/models/selfHelp');
const FAQ = require('../db/models/faqSchema');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');

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

// GET Requests
router.get('/', (req, res) => {
    FAQ.find({}, (err, faq) => {
        if(err){
            console.log(err);
            req.flash('fail', Keys.messages.dbError);
            return res.redirect('/');
        }
        gfs.files.find({}).toArray((err, files) => {
            if(err) error();
            res.locals.title = 'Help';
            selfHelp.find({}, (err, selfHelp) => {
                if(err) error();
                return res.render('help/index', {faq: faq, files: files, selfHelp: selfHelp});
            })
        });
    });
});

router.get('/guide/download/:id', (req, res) => {
    gfs.files.findOne({'metadata.uuid': req.params.id}, (err, file) => {
        if(err) error();
        res.set('Content-Type', file.contentType);
        res.set('Content-Disposition', `attachment; filename = "${file.metadata.displayName}"`);

        let readstream = gfs.createReadStream(file.filename);
        readstream.on('error', err => {
            res.end();
        });
        readstream.pipe(res);
    });
});

router.use('/guide/pdf/generate/download/:id', (req, res) => {
    selfHelp.findById(req.params.id, (err, help) => {
        if(err) error();
        pdf.create(help.guide, {
            border: '16mm',
            format: 'A4'
        }).toStream((err, stream) => {
            if(err) error();
            stream.pipe(res);
        });
    });
});

// POST Requests


module.exports= router;