const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.aliasQuery = {
    limit: '5',
    sort: '-ratingsAverage,price',
    fields: 'name,price,ratingsAverage,summary,difficulty',
  };
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  const queryParams = req.aliasQuery || req.query;
  const features = new APIFeatures(Tour.find(), queryParams)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  // const newTour = new Tour({});
  // newTour.save();
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
  //   catch (err) {
  //   console.log(err);
  //   res.status(400).json({
  //     status: 'fail',
  //     message: 'Invalid data sent!',
  //   });
  // }
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    plan,
  });
});

// FROM MORGAN - GET /api/v1/tours?duration=5&difficulty=easy 200 31.912 ms - 2027

//127.0.0.1:3000/api/v1/tours?duration[gte]=5&difficulty=easy&limit=2&sort=1
//Build query
// 1A) Filtering
//console.log(req.query); //{ duration: '5', difficulty: 'easy' } object type
// const queryObj = { ...queryParams }; //makes a shallow copy of the req.query
// console.log(queryObj); //{ duration: '5', difficulty: 'easy' } object type
// const excludedFields = ['page', 'sort', 'limit', 'fields'];
// excludedFields.forEach((el) => delete queryObj[el]);

// console.log('req.query after primary filtering', req.query);
// console.log('queryObj after primary filtering', queryObj);

// // req.query after primary filtering { duration: { gte: '5' }, difficulty: 'easy', limit: '2', sort: '1' }
// // queryObj after primary filtering { duration: { gte: '5' }, difficulty: 'easy' }

// // 1B) Advanced Filtering
// let queryStr = JSON.stringify(queryObj); //converts query of obj type to string
// queryStr = queryStr.replace(/\b(gte|lte|gt|lt)\b/g, (match) => `$${match}`); //adds a dollar sign
// console.log(JSON.parse(queryStr)); // { duration: { '$gte': '5' }, difficulty: 'easy' }
// let query = Tour.find(JSON.parse(queryStr)); // converts string back to object

// 2) Sorting
// if (queryParams.sort) {
//   const sortBy = queryParams.sort.split(',').join(' ');
//   // console.log(sortBy);
//   query = query.sort(sortBy); //query = query.sort('price'); - equivalent
// } else {
//   query = query.sort('-createdAt'); //descending order - newest ones appear first
// }

// 3) Field limiting
// if (queryParams.fields) {
//   const fields = queryParams.fields.split(',').join(' ');
//   query = query.select(fields);
// } else {
//   query = query.select('-__v'); //negative sign - exclude this field
// }

// 4) Pagination
// page=2 and limit=10 1 to 10 are on page 1 and 11 to 20 are on page 2
// const page = queryParams.page * 1 || 1;
// const limit = queryParams.limit * 1 || 100;
// const skip = (page - 1) * limit;

// console.log('LIMIT:', queryParams.limit);

// query = query.skip(skip).limit(limit);

// if (queryParams.page) {
//   const numTours = await Tour.countDocuments();
//   if (skip >= numTours) throw new Error('This page does not exist');
// }
