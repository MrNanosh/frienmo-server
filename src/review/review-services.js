const xss = require('xss')

const ReviewsService = {
    getById(db,id){
        return db
          .from('review AS rev')
          .select('*')
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
          reviewer: Number(review.reviewer) || {},
          reviewee: Number(review.reviewee) || {},

        }
      },
      serializeUser(user){
          return{
              id: user.id,
              username: user.username,
              name: user.name
          }
      },
    
    
        

    getReviewsByUserId(db,user_id){
        return db
        .from('review')
        .join('user AS reviewer', 'reviewer.id', '=' ,'review.reviewer')
        .join('user AS reviewee', 'reviewee.id', '=' ,'review.reviewee')
        .where('reviewer', '=',user_id)
        .select('review.*', 'reviewer.name AS reviewer_name', 'reviewee.name AS reviewee_name')
        

    },

    deleteReview(db,id){
        return db('review')
        .where({id})
        .delete()
    },

    updateReview(db,id,newReview){
        return db('review')
         .where({id})
         .update(newReview)
    }
}

module.exports = ReviewsService