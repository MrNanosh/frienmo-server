const reviewRouter = require('./review/review-router');

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const {
  NODE_ENV
} = require('./config');
const app = express();
const authRouter = require('./Auth/auth-router');

const friendRouter = require('./friend/friend-router');

const userRouter = require('./user/user-router');

const favorRouter = require('./favor/favor-router');

const categoryRouter = require('./category-router');



const morganOption =
  NODE_ENV === 'production'
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use('/api/auth', authRouter);

app.use('/api/friend', friendRouter);

app.use('/api/user', userRouter);
app.use('/api/review', reviewRouter);

app.use('/api/favor', favorRouter);

app.use(
  '/api/category',
  categoryRouter
);

app.use(function errorHandler(
  error,
  req,
  res,
  next
) {
  let response;
  if (NODE_ENV === 'production') {
    response = {
      error: { message: 'server error' }
    };
  } else {
    console.error(error);
    response = {
      message: error.message,
      error
    };
  }
  res.status(500).json(response);
});

module.exports = app;
