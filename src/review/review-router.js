const express = require('express')
const path = require('path')
const ReviewsService = require('./review-services')
const { requireAuth } = require('../middleware/jwt-auth')

const reviewsRouter = express.Router()
const jsonBodyParser = express.json()

reviewsRouter
    .route('/')
    .post(requireAuth, jsonBodyParser, (req,res,next) => {
        const { id, comment, reviewer, reviewee } = req.body
        const newReview = { id, comment, reviewer, reviewee}

        for (const [key, value] of Object.entries(newReview))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })

        newReview.id = req.user.id

        ReviewsService.insertReview(
            req.app.get('db'),
            newReview
          )
            .then(review => {
              res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${review.id}`))
                .json(ReviewsService.serializeReview(review))
            })
            .catch(next)
        

    })


module.exports = reviewsRouter