const express = require('express');
const categoryRouter = express.Router();

categoryRouter.get(
  '/',
  async (req, res, next) => {
    let db = req.app.get('db');
    let categories = await db(
      'category'
    ).select('*');

    return res
      .status(200)
      .json(categories);
  }
);

module.exports = categoryRouter;
