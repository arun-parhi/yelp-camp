const express = require('express');

const path = require("path");
const Campground = require("./models/campground");
const ejsMate = require('ejs-mate');

const mongoose = require("mongoose");
const methodOverride = require("method-override");

mongoose.set('strictQuery', false);

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/yelp-camp';
// const mongoUrl = 'mongodb+srv://arun:1205Arun@yelp-camp.ocmzay9.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(mongoUrl, {
    useNewUrlParser : true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
});

const morgan = require('morgan');

const AppError = require('./AppError');

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

app.get('/', (req, res) => {
    res.render("index");
});

app.get('/makecampground', async (req, res) => {
    const camp = new Campground({
        title: 'My Campground',
        description : 'Cheap campaign'
    });
    await camp.save();
    res.send(camp);
});

app.get('/campgrounds', async (req, res, next) => {
    try {
        const campgrounds = await Campground.find();
        res.render('campgrounds/index', { campgrounds });
    } catch (e) { 
        next(e);
    }
});

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.post('/campgrounds', async (req, res, next) => {
    try {
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (e) { 
        next(e);
    }
});

app.get('/campgrounds/:id', async (req, res, next) => {
    try {
        const campground = await Campground.findById(req.params.id);
        if (!campground) {
            return next(new AppError('Campground not found', 404));
        }
        res.render('campgrounds/view', { campground });
    } catch (e) { 
        next(e);
    }
});

app.get('/campgrounds/:id/edit', async (req, res, next) => {
    try {
        const campground = await Campground.findById(req.params.id);
        if (!campground) {
            return next(new AppError('Campground not found', 404));
        }
        res.render('campgrounds/edit', { campground });
    } catch (e) {
        next(e);
    }
});

app.put('/campgrounds/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
        if (!campground) {
            return next(new AppError('Campground not found', 404));
        }
        res.redirect(`/campgrounds/${id}`);
    } catch (e) {
        next(e);
    }
});

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params; 
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
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

app.use((err, req, res, next) => {
    // console.log("************************************");
    // console.log("**************ERROR*****************");
    // console.log("************************************");
    // console.log(err);
    // next(err);

    const { status = 500 } = err
    const { message = 'Something went wrong !!' } = err
    res.status(status).send(message);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Serving on port 3000");
});