const express = require('express');

const path = require("path");
const Campground = require("./models/campground");

const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser : true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
});

const morgan = require('morgan');

const app = express();

app.use(morgan('common'));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));



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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Serving on port 3000");
});