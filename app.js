// Requirements
const express = require('express'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    flash = require('connect-flash'),
    keys = require('./services/keys'),
    bodyParser = require('body-parser'),
    sanitizer = require('express-sanitizer'),
    localStrategy = require('passport-local'),
    http = require('https');
    methodOverride = require('method-override');


const app = express();

//DB
const User = require('./db/models/userSchema');

//DB Connection
mongoose.connect(keys.database.uri, {
    useNewUrlParser: true,
    useCreateIndex: true
}, (err) => {
    if (err) return console.log(err);
    console.log('Connected to the DB');
});

//Middleware
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.use(require('cookie-session')({
    name: 'DoddGroupSession',
    keys: [keys.app.sessionKeys],
    maxAge: keys.app.cookieAge
}));
app.use(flash());
app.use(sanitizer());
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
    res.locals.validation = {};
    res.locals.title = '';
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
});

//Routes
let baseRoute = require('./routes/base'),
    adminRoute = require('./routes/admin'),
    helpRoutes = require('./routes/help');

//Routing
app.use('/', baseRoute);
app.use('/admin', adminRoute);
app.use('/help', helpRoutes);
app.get('*', (req, res) => {
    res.render('base/404', {url: req.url});
});

// Listener
app.listen(keys.app.port, () => {
    console.log(`App now listening on port: ${keys.app.port}`);
});