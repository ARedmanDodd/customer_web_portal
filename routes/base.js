const express = require('express'),
    User = require('../db/models/userSchema'),
    keys = require('../services/keys'),
    passport = require('passport'),
    router = express.Router(),
    api = require('../api.js');
    sql = require('mssql');

const request = new sql.Request();
const smsMessage = new api.SmsMessage();
const smsApi = new api.SMSApi("doddwebapi", "BC15FD87-A102-360D-A187-E83405B9FF0C");
const smsCollection = new api.SmsMessageCollection();
smsCollection.messages = [smsMessage];

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
    request.query(`SELECT TOP 1 * FROM SERVICERECORDS_SITE_AGREEMENT_DETAILS WHERE PROPERTY_REFERENCE = '${req.body.signup.HRN_Number}'`, (err, record) => {
        if (err) {
            req.flash('fail', keys.messages.dbError);
            if (keys.debug) console.log(err);
            return res.redirect('/register');
        }
        User.findOne({
            $or: [
                { username: req.body.signup.username },
                { email: req.body.signup.email }
            ]
        }, (err, user) => {
            if (err) {
                req.flash('fail', keys.messages.dbError);
                if (keys.debug) console.log(err);
                return res.redirect('/register');
            }
            if (user || record.recordset.length > 0) {
                let value;
                request.query(`SELECT TOP 1 * FROM SALES_ACCOUNTS WHERE ACCOUNT_NUMBER = '${record.recordset[0].SITE_ACCOUNT_NUMBER}'`, (err, siteAccount) => {
                    if(err){
                        req.flash('fail', keys.messages.dbError);
                        if (keys.debug) console.log(err);
                        return res.redirect('/register');
                    }
                    for (key in req.body.signup) {
                        value = req.body.signup[key];
                        res.locals.validation[key] = value;
                        if (req.body.signup.password !== req.body.signup.confirm_password) {
                            res.locals.validation[`${key}invalid`] = 1;
                            res.locals.validation['error'] = true;
                        }
                        if (record.recordset.length < 1) continue;
                        switch (key) {
                            case 'HRN_Number': {
                                if(record.recordset.length > 0){
                                    if(record.recordset[0].PROPERTY_REFERENCE.replace(/ /g, '') !== req.body.signup.HRN_Number){
                                        res.locals.validation[`${key}invalid`] = 1;
                                        res.locals.validation['error'] = true;
                                        continue;   
                                    }
                                }
                                break;
                            }
                            case 'postcode': {
                                if(!siteAccount.recordset[0].POST_CODE.replace(/ /g, '').includes(req.body.signup.postcode.replace(/ /g, ''))){
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
                    if (res.locals.validation.error) {
                        return res.render('base/register', { fail: 'Errors were found in the details that you provided. Please check and try again.' });
                    } else {
                        User.register(new User({
                            HRN_Number: req.body.signup.HRN_Number,
                            username: req.body.signup.username.toLowerCase(),
                            firstName: req.body.signup.firstName.charAt(0).toUpperCase() + req.body.signup.firstName.substr(1),
                            surname: req.body.signup.surname.charAt(0).toUpperCase() + req.body.signup.surname.substr(1),
                            site_account_number: record.recordset[0].SITE_ACCOUNT_NUMBER,
                            email: req.body.signup.email.toLowerCase(),
                            clientID: record.recordset[0].CLIENT_ACCOUNT_NUMBER
                        }), req.body.signup.password, (err, user) => {
                            if (err) {
                                req.flash('fail', keys.messages.dbError);
                                if (keys.debug) console.log(err);
                                return res.redirect('/register');
                            }
                            req.flash('success', 'Registration successful.');
                            return res.redirect('/')
                        })
                    }
                });
            }
        })
    });
});

router.post('/login', passport.authenticate('local', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/'
}), (req, res) => {
});


// router.get('/test', (req, res) => {
//     request.query("SELECT TOP 100 * FROM SERVICERECORDS_SITE_AGREEMENT_EXT", (err, record) => {
//         if(err) console.log(err);
//         res.send(record);
//     });
// SELECT TOP 100 * FROM SERVICERECORDS_SITE_AGREEMENT_DETAILS WHERE SITE_ACCOUNT_NUMBER = '${req.body.reference}'
//      select table_name,column_name from information_schema.columns where column_name like '%tax%'
// SELECT TOP 1 * FROM SALES_ACCOUNTS WHERE SITE_ACCOUNT_NUMBER = '218397'
// select table_name,column_name from information_schema.columns where column_name like '_vix_KEY_JOB'
// })


// TEST PAGE

router.get('/test', (req, res) => {
    let data = {};
    return res.render('base/test', { data: data });
});

router.get('/text', (req, res) => {
    smsMessage.from = 'Dodd_Group';
    smsMessage.to = "+447970790988";
    smsMessage.body = 'Dodd Group message api verification';
    smsApi.smsSendPost(smsCollection).then(function(response){
        res.send(response.body);
    }).catch(err => {
        console.log(err.body);
    })
})


router.post('/test', (req, res) => {
    request.query(`SELECT TOP ${req.body.amount} * FROM ${req.body.table} WHERE ${req.body.field} = '${req.body.data}'`, (err, record) => {
        if (err) console.log(err);
        return res.send(record.recordset);
    })
});

router.post('/test/column', (req, res) => {
    request.query(`select table_name,column_name from information_schema.columns where column_name like '${req.body.reference}'`, (err, record) => {
        if(err) console.log(err);
        return res.send(record.recordset);
    })
});

module.exports = router;