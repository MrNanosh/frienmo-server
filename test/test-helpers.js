const knex = require('knex')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { DATABASE_TEST_URL } = require('../src/config')

/**
 * create a knex instance connected to postgres
 * @returns {knex instance}
 */
function makeKnexInstance() {
  return knex({
    client: 'pg',
    connection: DATABASE_TEST_URL,
  })
}

/**
 * create a knex instance connected to postgres
 * @returns {array} of user objects
 */

function makeReviewsArray(users){
  return [
    {
      id: 2,
      comment: "bad comment",
      reviewer: users[0].id,
      reviewee: users[1].id,
    },
    {
      id: 3,
      comment: "good comment",
      reviewer: users[1].id,
      reviewee: users[0].id,
    },
  ]
}



function makeUsersArray() {
  return [
    {
      id: 2,
      username: 'test-user-1',
      name: 'Test user 1',
      password: 'password',
      phone: '1234567890',
      description: 'bleh'
    },
    {
      id: 3,
      username: 'test-user-2',
      name: 'Test user 2',
      password: 'password',
      phone: '1234567890',
      description: ''
    },
  ]
}

/**
 * generate fixtures of languages and words for a given user
 * @param {object} user - contains `id` property
 * @returns {Array(languages, words)} - arrays of languages and words
 */
function makeUsersAndFavors() {


  const outstanding = [
      {
       id: 1,
       favor_id: 1,
       users_id: 1,
       reciever_id: 2,
       reciever_redeemed: true,
       giver_redeemed: true,
      },
      {
        id: 2,
        favor_id: 2,
        users_id: 2,
        reciever_id: 2,
        reciever_redeemed: true,
        giver_redeemed: false,
       },
       {
        id: 3,
        favor_id: 3,
        users_id: 3,
        reciever_id: 2,
        reciever_redeemed: false,
        giver_redeemed: false,
       },
  ]
  const friend = [
    {
      user_id: 1,
      friend_id: 2,
      accepted: true
    },
    {
      user_id: 2,
      friend_id: 1,
      accepted: true
      },

  ]
  const review = [
   { id: 1,
    reviewer: 1,
    reviewee: 2,
    comment: 'testcomment'
   }, 
   { id: 2,
    reviewer: 2,
    reviewee: 1,
    comment: 'testcomment'
   }, 
  ]
  
  const favor = [
    {
      id: 1,
      title: 'title 1',
      description: 'description 1',
      creator_id: 1,
      expiration_date: 2,
    },
    {
      id: 2,
      title: 'title 2',
      description: 'description 2',
      creator_id: 2,
      expiration_date: '',
    },
   
  ]

  return [favor, review, friend, outstanding]
}

/**
 * make a bearer token with jwt for authorization header
 * @param {object} user - contains `id`, `username`
 * @param {string} secret - used to create the JWT
 * @returns {string} - for HTTP authorization header
 */
function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

/**
 * remove data from tables and reset sequences for SERIAL id fields
 * @param {knex instance} db
 * @returns {Promise} - when tables are cleared
 */
function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        "user",
        "favor",
        "outstanding",
        "friend",
        "review"
        `
      )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE user_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE favor_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE outstanding_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE review_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('user_id_seq', 0)`),
          trx.raw(`SELECT setval('favor_id_seq', 0)`),
          trx.raw(`SELECT setval('outstanding_id_seq', 0)`),
          trx.raw(`SELECT setval('review_id_seq', 0)`),

        ])
      )
  )
}

/**
 * insert users into db with bcrypted passwords and update sequence
 * @param {knex instance} db
 * @param {array} users - array of user objects for insertion
 * @returns {Promise} - when users table seeded
 */
function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  console.log("PREPPEDUSERS",preppedUsers)
  return db.transaction(async trx => {
    await trx.into('user').insert(preppedUsers)

    // await trx.raw(
    //   `SELECT setval('user_id_seq', ?)`,
    //   [users[users.length - 1].id],
    // )
  })
}

/**
 * seed the databases with words and update sequence counter
 * @param {knex instance} db
 * @param {array} users - array of user objects for insertion
 * @param {array} favor - array of favors objects for insertion
 * @param {array} outstanding - array of outstanding objects for insertion
 * @param {array} review - array of review objects for insertion

 * @returns {Promise} - when all tables seeded
 */
async function seedUsersFavor(db, users, favor, outstanding, review, friend) {
  await seedUsers(db, users)

  await db.transaction(async trx => {
    await trx.into('favor').insert(favor)
    await trx.into('outstanding').insert(outstanding)
    await trx.into('review').insert(review)
    await trx.into('friend').insert(friend)


    const favorDescrip = favor.find(
      fav => fav.creator_id === favor[0].id
    )

    await Promise.all([
      trx.raw(
        `SELECT setval('user_id_seq', ?)`,
        [user[user.length - 1].id],
      ),
      trx.raw(
        `SELECT setval('favor_id_seq', ?)`,
        [favor[favor.length - 1].id],
      ),
      trx.raw(
        `SELECT setval('outstanding_id_seq', ?)`,
        [outstanding[outstanding.length - 1].id],
      ),
      trx.raw(
        `SELECT setval('review_id_seq', ?)`,
        [review[review.length - 1].id],
      ),
    ])
  })
}

function seedReviewsTables(db, users, reviews=[]) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('review').insert(reviews)
  })
}


function makeReviewsFixtures() {
  const testUsers = makeUsersArray()
  const testReviews = makeReviewsArray(testUsers)
  return { testUsers, testReviews }
}

function makeExpectedReview(users, reviewId, reviews) {
  console.log("reviews",reviews)
  const expectedreviews = reviews.filter(review => review.reviewee === reviewId)
  return expectedreviews
}

module.exports = {
  makeExpectedReview,
  makeReviewsFixtures,
  seedReviewsTables,
  makeReviewsArray,
  makeKnexInstance,
  makeUsersArray,
  makeUsersAndFavors,
  makeAuthHeader,
  cleanTables,
  seedUsers,
  seedUsersFavor,
}