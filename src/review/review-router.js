const express = require('express')
const path = require('path')
const ReviewsService = require('./review-services')
const { requireAuth } = require('../middleware/jwt-auth')

const reviewsRouter = express.Router()
const jsonBodyParser = express.json()

reviewsRouter
    .route('/')
    .post(requireAuth, jsonBodyParser, (req,res,next) => {
        const { comment,  reviewee } = req.body
        const newReview = {  comment, reviewee}

        for (const [key, value] of Object.entries(newReview))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })

        newReview.reviewer = req.user.id
        console.log("newReview", newReview)

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
        
reviewsRouter
  .route('/:id')
  .get((req,res,) => {
      res.json(ReviewsService.serializeReview(res.review))
  })

reviewsRouter
  .route('/user/:user_id')
  .get((req,res,next) => {
    ReviewsService.getReviewForUser(
        req.app.get('db'),
        req.params.user_id
    )
    .then(reviews => {
        res.json(ReviewsService.serializeReviews(reviews))
    })
    .catch(next)
  })

    })


module.exports = reviewsRouter