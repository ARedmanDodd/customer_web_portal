const express = require('express'),
    router = express.Router(),
    News = require('../db/models/newsSchema'),
    keys = require('../services/keys');


// GET Requests

router.get('/:id', (req, res) => {
    News.findById(req.params.id, (err, news) => {
        if(err){
            if (keys.debug) console.log(err);
            req.flash('fail', keys.messages.dbError);
            return res.redirect(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        }
        return res.render('news/article', {news: news});
    })
})

// POST Requests



module.exports= router;