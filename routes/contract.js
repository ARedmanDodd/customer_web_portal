const express = require('express'),
    router = express.Router(),
    keys = require('../services/keys'),
    sql = require('mssql'),
    sqlRequest = new sql.Request(),
    News = require('../db/models/newsSchema'),
    User = require('../db/models/userSchema'),
    Client = require('../db/models/clientSchema'),
    querystring = require('querystring'),
    moment = require('moment'),
    request = require('request');

router.use((req, res, next) => {
    if (!req.user) return isLoggedIn(req, res);

    sqlRequest.query(`SELECT TOP 1 * FROM SALES_ACCOUNTS WHERE ACCOUNT_NUMBER = '${res.locals.user.clientID}'`, (err, record) => {
        if (err) {
            next();
        } else {
            res.locals.client = record.recordset[0];
            next();
        }
    })

    // Client.findById(res.locals.user.clientID, (err, client) => {
    //     if (err) {
    //         next();
    //     } else {
    //         res.locals.client = client
    //         next();
    //     }
    // })
});

router.use((req, res, next) => {
    if (!req.user) return isLoggedIn(req, res);
    sqlRequest.query(`SELECT TOP 1 * FROM SALES_ACCOUNTS WHERE ACCOUNT_NUMBER = '${res.locals.user.site_account_number}'`, (err, record) => {
        if (err) {
            next()
        } else {
            res.locals.property = record.recordset[0];
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

router.get('/', isLoggedIn, (req, res) => {
    /* res.locals.title = res.locals.title.businessName
    let form = {
        grant_type: 'password',
        username: keys.causeway.username,
        password: keys.causeway.password
    };
    var formData = querystring.stringify(form);
    let cars;
    req.io.on('connection', socket => {
        request({
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            uri: 'https://telematics.causeway.com/auth/oauth/token',
            body: formData,
            method: 'POST'
        }, (err, response, body) => {
            if (err) {
                console.log(err);
            }
            body = JSON.parse(body)
            request({
                uri: 'https://telematics.causeway.com/data/api/latestinstances/assetsandposition',
                auth: {
                    'bearer': body.access_token
                },
                method: 'GET',
            }, (err, request, body) => {
                if (err) console.log(err);
                socket.volatile.emit('map', { 'data': JSON.parse(body) });
            })
        });
        let timer = setInterval(() => {
            request({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                uri: 'https://telematics.causeway.com/auth/oauth/token',
                body: formData,
                method: 'POST'
            }, (err, response, body) => {
                if (err) {
                    console.log(err);
                }
                body = JSON.parse(body)
                request({
                    uri: 'https://telematics.causeway.com/data/api/latestinstances/assetsandposition',
                    auth: {
                        'bearer': body.access_token
                    },
                    method: 'GET',
                }, (err, request, body) => {
                    if (err) console.log(err);
                    socket.emit('map', { 'data': JSON.parse(body) });
                })
            });
        }, keys.google.refreshRate);
        socket.on('disconnect', function () {
            clearInterval(timer);
        });
    }); */

    

    sqlRequest.query(`SELECT TOP 15 * FROM JOBCOSTING_JOBS WHERE JOB_NUMBER = '${res.locals.user.site_account_number}' ORDER BY ACTUAL_START_DATE DESC`, (err, record) => {
        if (err) {
            if (keys.debug) console.log(err);
            req.flash('fail', keys.messages.dbError);
            return res.redirect(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        }
        let account = record.recordset;
        for (i = 0; i < account.length; i++) {
            account[i].ACTUAL_START_DATE = moment(account[i].ACTUAL_START_DATE).format('Do MMM YYYY');
        }
        News.find({}).sort({date: -1}).limit(10).exec((err, news) => {
            if(err){
                if (keys.debug) console.log(err);
                req.flash('fail', keys.messages.dbError);
                return res.redirect(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
            }
            return res.render('contract/index', {report: account, news: news});
        });
    });
});

router.get('/hist/:JOB_NUMBER/:jobNo', (req, res) => {
    request.get(`http://10.10.1.21:54010/api.vixen/jobs/reactive/id/01${req.params.JOB_NUMBER}${req.params.jobNo}`, (err, data) => {
        if(err){
            if (keys.debug) console.log(err);
            req.flash('fail', keys.messages.dbError);
            return res.redirect(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        }
        data = JSON.parse(data.body);
        data.actualStartDate = moment(data.actualStartDate.replace(/-/g, "")).format('l');
        data.completionDate = moment(data.completionDate.replace(/-/g, "")).format('l');
        request.get(`http://10.10.1.21:54010/api.vixen/engineers/id/01${data.engineer}`, (err, egn) => {
            if(err){
                if (keys.debug) console.log(err);
                req.flash('fail', keys.messages.dbError);
                return res.redirect(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
            }
            return res.render('contract/history', {
                history: data,
                engineer: JSON.parse(egn.body)
            });
        })
    })
})

router.get('/account', isLoggedIn, (req, res) => {
    return res.render('contract/account');
})

// POST Requests


module.exports = router;