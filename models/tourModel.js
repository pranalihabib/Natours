const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'The tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'The tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'The tour must have a difficulty level'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    required: [true, 'A tour must have a summary'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: [Date],
});

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOUMENT MIDDLEWARE THAT RUNS BETWEEN .save() AND .create() COMMAND
tourSchema.pre('save', function () {
  this.slug = slugify(this.name, { lower: true });
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
