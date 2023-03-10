const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: {
        type: String,
        required : [true, 'Title can not be blank !!']
    },
    price: {
        type: Number,
        required: true,
        min : 0
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('Campground', CampgroundSchema);
