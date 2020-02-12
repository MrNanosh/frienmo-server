const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('reviews Endpoints', function() {
  let db

  const { testReviews, testUsers, } = helpers.makeReviewsFixtures()


  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.DATABASE_TEST_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`POST /api/review`, () => {
    beforeEach('insert review', () =>
      helpers.seedReviewsTables(
        db,
        testUsers,
        testReviews,
      )
    )

    it(`creates a review, responding with 201 and the new review`, function() {
        const testReview = testReviews[0]
        const testUser = testUsers
        console.log(testUser)
        const newreview = {
            id: 3,
            comment: 'Test new review',
            reviewer: testUser[1].id,
            reviewee: 3,
        }
        console.log(newreview)
        return supertest(app)
          .post('/api/review')
          .set('Authorization', helpers.makeAuthHeader(testUsers))
          .send(newreview)
          .expect(201)
          .expect(res => {
             console.log('response',res)
        //     expect(res.body).to.have.property('id')
        //     expect(res.body.comment).to.eql(newreview.comment)
        //     // expect(res.body.reviewer).to.eql(newreview.reviewer)
        //     // expect(res.body.reviewee).to.eql(newreview.reviewee)
        //     // expect(res.body.id).to.eql(newreview.id)
        //     // expect(res.body.user.id).to.eql(testUser.id)
        //     expect(res.headers.location).to.eql(`/api/review/${res.body.id}`)
        //   })
        //   .expect(res =>
        //     db
        //       .from('review')
        //       .select('*')
        //       .where({ id: res.body.id })
        //       .first()
        //       .then(row => {
        //         expect(row.comment).to.eql(newreview.comment)
        //         expect(row.id).to.eql(newreview.id)
        //         expect(row.use.id).to.eql(testUser.id)
             })
        //   )
      })




})



})