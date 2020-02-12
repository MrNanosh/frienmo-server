const xss = require('xss')

const ReviewsService = {
    getById(db,id){
        return db
          .from('reviews AS rev')
          .select(
              'rev.id',
              'rev.comment',
              'rev.reviewer',
              'rev.reviewee'
           )
          .where('rev.id',id)
          .first()
    },


    insertReview(db, newReview){
        return db
            .insert(newReview)
            .into('review')
            .returning('*')
            .then(([review]) => review)
            .then(review => 
                ReviewsService.getById(db,review.id)
                )
    },
    
    serializeReview(review) {
        return {
          id: review.id,
          comment: xss(review.comment),
          reviewer: review.reviewer || {},
          reviewee: review.reviewee|| {},

        }
      },

}

module.exports = ReviewsService