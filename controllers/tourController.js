const Tour = require('./../models/tourModel');

// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);
//   if (req.params.id > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'invalid ID',
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   console.log(req.body);
//   if (!req.body.name || !req.body.price) {
//     res.status(400).json({
//       status: 'fail',
//       message:
//         'Price and name not contained in the request body',
//     });
//   }
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.aliasQuery = {
    limit: '5',
    sort: '-ratingsAverage,price',
    fields: 'name,price,ratingsAverage,summary,difficulty',
  };
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // FROM MORGAN - GET /api/v1/tours?duration=5&difficulty=easy 200 31.912 ms - 2027

    //127.0.0.1:3000/api/v1/tours?duration[gte]=5&difficulty=easy&limit=2&sort=1
    //Build query
    // 1A) Filtering
    console.log(req.query); //{ duration: '5', difficulty: 'easy' } object type
    const queryParams = req.aliasQuery || req.query;
    const queryObj = { ...queryParams }; //makes a shallow copy of the req.query
    console.log(queryObj); //{ duration: '5', difficulty: 'easy' } object type
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    console.log('req.query after primary filtering', req.query);
    console.log('queryObj after primary filtering', queryObj);

    // req.query after primary filtering { duration: { gte: '5' }, difficulty: 'easy', limit: '2', sort: '1' }
    // queryObj after primary filtering { duration: { gte: '5' }, difficulty: 'easy' }

    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj); //converts query of obj type to string
    queryStr = queryStr.replace(/\b(gte|lte|gt|lt)\b/g, (match) => `$${match}`); //adds a dollar sign
    console.log(JSON.parse(queryStr)); // { duration: { '$gte': '5' }, difficulty: 'easy' }
    let query = Tour.find(JSON.parse(queryStr)); // converts string back to object

    // 2) Sorting
    if (queryParams.sort) {
      const sortBy = queryParams.sort.split(',').join(' ');
      // console.log(sortBy);
      query = query.sort(sortBy); //query = query.sort('price'); - equivalent
    } else {
      query = query.sort('-createdAt'); //descending order - newest ones appear first
    }

    // 3) Field limiting
    if (queryParams.fields) {
      const fields = queryParams.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v'); //negative sign - exclude this field
    }

    // 4) Pagination
    // page=2 and limit=10 1 to 10 are on page 1 and 11 to 20 are on page 2
    const page = queryParams.page * 1 || 1;
    const limit = queryParams.limit * 1 || 100;
    const skip = (page - 1) * limit;

    console.log('LIMIT:', queryParams.limit);

    query = query.skip(skip).limit(limit);

    if (queryParams.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    }

    const tours = await query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id); //Tour.findOne({_id: req.params.id})
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({});
    // newTour.save();
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status.json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour: '<Updated tour here...>',
      },
    });
  } catch (err) {
    res.status.json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status.json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};
