const express = require('express');
const morgan = require('morgan');

const app = express();

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.set('query parser', 'extended');
// app.set('query parser');
// { difficulty: 'easy', duration: { gte: '5' } } - extended
//{ difficulty: 'easy', 'duration[gte]': '5' } - without extended
// helps with mongo queries

//user defined middlware
// app.use((req, res, next) => {
//   console.log('Middleware');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// app.all('*', (req, res, next) => {
//   // res.status(404).json({
//   //   status: 'fail',
//   //   message: `Cant find ${req.originalUrl} on this server.`,
//   // });

//   const err = new Error(`Can't find ${req.originalUrl} on this server.`);
//   ((err.status = 'fail'), (err.statusCode = 404));
//   next();
// });

app.all('/{*splat}', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side1111', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint');
// });

// 2) ROUTE HANDLERS

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);

// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
