const express = require('express');
const router = express.Router();

const Campground = require("../models/campground");
const Joi = require('joi');
const AppError = require('../utils/AppError');

router.get('/', wrapAsync(async (req, res, next) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds });
}));

router.get('/new', (req, res) => {
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

router.post('/', validateCampground, wrapAsync(async (req, res, next) => {
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

router.get('/:id', wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        throw new AppError('Campground not found', 404);
    }
    res.render('campgrounds/view', { campground });
}));

router.get('/:id/edit', wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        throw new AppError('Campground not found', 404);
    }
    res.render('campgrounds/edit', { campground });
}));

router.put('/:id', validateCampground, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    if (!campground) {
        throw new AppError('Campground not found', 404);
    }
    res.redirect(`/campgrounds/${id}`);
}));

router.delete('/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params; 
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

module.exports = router;