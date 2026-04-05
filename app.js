const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const sanitize = require('@exortek/express-mongo-sanitize');
const sanitizeHtml = require('sanitize-html');

const app = express();

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// Set security http headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limiting amount of requests to 100
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again an hour later.',
});
app.use('/api', limiter);

// Body parser, reading the data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(sanitize());

// Data sanitization against XSS
app.use((req, res, next) => {
  if (req.body) {
    Object.entries(req.body).forEach(([key, value]) => {
      if (typeof value === 'string') {
        req.body[key] = sanitizeHtml(value);
      }
    });
  }

  if (req.query) {
    Object.entries(req.query).forEach(([key, value]) => {
      if (typeof value === 'string') {
        req.query[key] = sanitizeHtml(value);
      }
    });
  }

  if (req.params) {
    Object.entries(req.params).forEach(([key, value]) => {
      if (typeof value === 'string') {
        req.params[key] = sanitizeHtml(value);
      }
    });
  }
  next();
});

// Serving static files
app.use(express.static(`${__dirname}/public`));
app.set('query parser', 'extended');

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('/{*splat}', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
