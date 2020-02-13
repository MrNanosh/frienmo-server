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
        .select('*')
        .join('user', {'review.reviewee': 'user.id'})
        .where('review.reviewee',user_id)
        // .first()

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