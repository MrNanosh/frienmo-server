const jwt = require('jsonwebtoken')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Auth Endpoints', function () {
  let db

  const testUsers = helpers.makeUsersArray()
  const testUser = testUsers[0]

  before('make knex instance', () => {
    db = helpers.makeKnexInstance()
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe('GET /api/friend', () =>{
    it('returns all accepted friends for a user', () =>{
        return supertest(app)
        .get('/api/friend')
        .expect(200)
        .expect(res =>{
            expect(res.body).to.have.keys('user_id', 'friend_id', 'accepted')
            expect(res.body).to.have.property()
        })
    })
  })

  describe('POST /api/friend', () =>{

  })

  describe('PATCH /api/friend', () =>{

  })

  describe('DELETE /api/friend', () =>{

  })
});