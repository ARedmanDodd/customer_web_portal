// Requirements
const express = require('express'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    flash = require('connect-flash'),
    keys = require('./services/keys'),
    bodyParser = require('body-parser'),
    localStrategy = require('passport-local'),
    methodOverride = require('method-override'),
    passportLocalMongoose = require('passport-local-mongoose');


const app = express();

//Routes
let baseRoute = require('./routes/base');

//DB
const User = require('./db/models/userSchema');

//DB Connection
mongoose.connect(keys.database.uri, {
    useNewUrlParser: true,
    useCreateIndex: true
},(err) => {
    if(err) return console.log(err);
    console.log('Connected to the DB');
});

//Middleware
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.use(require('cookie-session')({
    name: 'Dodd Group Session',
    keys: keys.app.sessionKeys,
    maxAge: keys.app.cookieAge
}));
app.use(flash());
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());

//passport preferences
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Flash
app.use((req, res, next) => {
    res.locals.fail = req.flash('fail');
    res.locals.success = req.flash('success');
    if (!req.user) {
        res.locals.user = req.user;
        next();
    } else {
        User.findById(req.user.id, (err, dbUser) => {
            if (err) {
                res.locals.user = req.user
                next();
            } else {
                res.locals.user = dbUser
                next();
            }
        })
    }
    res.locals.title = '';
});

//Routing
app.use('/', baseRoute);
app.get('*', (req, res) => {
    res.render('base/404');
});

// Listener
app.listen(keys.app.port, () => {
    console.log(`App now listening on port: ${keys.app.port}`);
});