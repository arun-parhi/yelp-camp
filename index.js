const express = require('express');

const path = require("path");
const Campground = require("./models/campground");
const ejsMate = require('ejs-mate');
const Joi = require('joi');

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

app.get('/campgrounds', wrapAsync(async (req, res, next) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds });
}));

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

const validateCampground = (req, res, next) => { 
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            location: Joi.string().required(),
            image: Joi.string().required(),
            description: Joi.string().required()
        }).required()
    });
    const { error } = campgroundSchema.validate(req.body);
    
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        throw new AppError(msg, 400)
    } else { 
        next()
    }  
}

app.post('/campgrounds', validateCampground, wrapAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new AppError('Invalid campground data', 404);
    
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})); 

function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}

app.get('/campgrounds/:id', wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        throw new AppError('Campground not found', 404);
    }
    res.render('campgrounds/view', { campground });
}));

app.get('/campgrounds/:id/edit', wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        throw new AppError('Campground not found', 404);
    }
    res.render('campgrounds/edit', { campground });
}));

app.put('/campgrounds/:id', validateCampground, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    if (!campground) {
        throw new AppError('Campground not found', 404);
    }
    res.redirect(`/campgrounds/${id}`);
}));

app.delete('/campgrounds/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params; 
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

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