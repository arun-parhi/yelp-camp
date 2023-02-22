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
    res.send("Sorry you need a password !!");
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

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds });
});

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
});

app.get('/campgrounds/:id', async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/view', {campground});
});

app.get('/campgrounds/:id/edit', async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
});

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params; 
    await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${id}`);
});

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params; 
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
});

app.get('/secret', verifyPassword, (req, res) => {
    res.send('My secret is : I eat less, walk more.');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Serving on port 3000");
});