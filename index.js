const express = require('express');

const path = require("path");
const Campground = require("./models/campground");
const ejsMate = require('ejs-mate');

const mongoose = require("mongoose");
mongoose.set('strictQuery', false);

const mongoUrl = process.env.MONGO || 'mongodb://localhost:27017/yelp-camp';
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

app.get('/secret', verifyPassword, (req, res) => {
    res.send('My secret is : I eat less, walk more.');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Serving on port 3000");
});