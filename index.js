const express = require('express');

const path = require("path");
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const campgroundRoutes = require('./routes/campgrounds');
const userRoutes = require('./routes/users');

const mongoose = require("mongoose");
const methodOverride = require("method-override");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

mongoose.set('strictQuery', false);

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/yelp-camp';
// const mongoUrl = 'mongodb+srv://arun:1205Arun@yelp-camp.ocmzay9.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(mongoUrl, {
    useNewUrlParser : true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
});

const morgan = require('morgan');

const AppError = require('./utils/AppError');

const app = express(); 

app.use(morgan('common'));

app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const verifyPassword = (req, res, next) => {
    const { password } = req.query;
    if (password === 'passsword') { 
        next();
    }

    throw new AppError('Sorry you need a password !!', 401);
}

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use((req, res, next) => { 
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);


app.get('/', (req, res) => {
    res.render("index");
});

app.get('/secret', verifyPassword, (req, res) => {
    res.send('My secret is : I eat less, walk more.');
});

app.get('/error', (req, res) => {
    apppp.count();
});

app.use((req, res) => {
    res.status(404).render('error/404');
});

handleValidationErr = err => {
    return new AppError(`Validation Failed ... ${err.message}`, 400)
}

app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') err = handleValidationErr(err)
    next(err);
})

app.use((err, req, res, next) => {
    const { status = 500 } = err
    const { message = 'Something went wrong !!' } = err
    res.status(status).render('error/error', { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Serving on port 3000");
});