// Requirements
const express = require('express'),
    sql = require('mssql'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    flash = require('connect-flash'),
    keys = require('./services/keys'),
    bodyParser = require('body-parser'),
    sanitizer = require('express-sanitizer'),
    localStrategy = require('passport-local'),
    methodOverride = require('method-override');


const app = express();

//DB
const User = require('./db/models/userSchema');

// SQL Connection
sql.connect(keys.sql, err => {
    if(err){
        console.log('Failed to connect to SQL');
        console.log(err)
    }else{
        console.log('connected to SQL');
    }
})

// Sockets
let io = require('socket.io').listen(app.listen(keys.app.port, () => {
    console.log(`App now listening on port: ${keys.app.port}`);
}));
app.setMaxListeners(0);
io.setMaxListeners(0);

//DB Connection
mongoose.connect(keys.database.uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}, (err) => {
    if (err) return console.log(err);
    console.log('Connected to the MongoDB');
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
    res.locals.gAPI = keys.google.map;
    req.io = io;
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
    clientRoute = require('./routes/client'),
    helpRoutes = require('./routes/help'),
    newsRoutes = require('./routes/news'),
    contractRoutes = require('./routes/contract');

//Routing
app.use('/', baseRoute);
app.use('/admin', adminRoute);
app.use('/help', helpRoutes);
app.use('/client', clientRoute);
app.use('/contract', contractRoutes);
app.use('/news', newsRoutes);
app.get('*', (req, res) => {
    async () => {
        try {
            console.log('connecting...');
            await sql.connect(`mssql://${keys.sql.user}:${keys.sql.password}@${keys.sql.server}/${keys.sql.database};`)
            const result = await sql.query`select * from VERSION where ID = "1"`
            console.dir(result)
        } catch (err) {
            console.log(err);
        }
    }
    res.render('base/404', {url: req.url});
});

// Listener
// app.listen(keys.app.port, () => {
//     console.log(`App now listening on port: ${keys.app.port}`);
// });