const xss = require('xss')

const ReviewsService = {
    getById(db,id){
        return db
          .from('review AS rev')
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
        console.log("serializeReview",review)
        return {
          id: review.id,
          comment: xss(review.comment),
          reviewer: review.reviewer || {},
          reviewee: review.reviewee|| {},

        }
      },
      serializeUser(user){
          return{
              id: user.id,
              username: user.username,
              name: user.name
          }
      },
    
    serializeReviews(reviews){
        return reviews.map(this.serializeReview)
    },

    getUserId(db,user_id){
        console.log("getUserId",user_id)
        return db
        .from('user')
        .select('*')
        .where('user.id',user_id)
        .first()

    },

}

module.exports = ReviewsService