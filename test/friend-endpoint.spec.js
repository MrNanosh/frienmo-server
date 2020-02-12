const jwt = require('jsonwebtoken')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Auth Endpoints', function () {
    let db

    const testUsers = helpers.makeUsersArray()
    const testUser = testUsers[0]
    const arr = helpers.makeUsersAndFavors()
    const favor = arr[0]
    const review = arr[1]
    const friend = arr[2]
    const outstanding = arr[3]


    before('make knex instance', () => {
        db = helpers.makeKnexInstance()
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe('GET /api/friend', () => {
        beforeEach('insert users', () =>
            helpers.seedUsersFavor(
                db,
                testUsers,
                favor,
                outstanding,
                review,
                friend
            )
        )
        it('returns all accepted friends for a user', () => {
            return supertest(app)
                .get('/api/friend')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .expect(200)
                .expect(res => {
                    console.log('resbody is ', res.body);
                    expect(res.body).to.have.length(1);
                    expect(res.body[0]).to.have.keys('user_id', 'friend_id', 'accepted')
                    expect(res.body[0]).to.have.property('user_id', 1)
                    expect(res.body[0]).to.have.property('friend_id', 2)
                    expect(res.body[0]).to.have.property('accepted', true)
                })
        })
    })

    describe('POST /api/friend', () => {
        beforeEach('insert users', () =>
            helpers.seedUsersFavor(
                db,
                testUsers,
                favor,
                outstanding,
                review,
                friend
            )
        )
        it('makes a new friend request with one accepted and the other unaccepted', () => {
            return supertest(app)
                .post('/api/friend')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .expect(201)

        })
    })

    describe('PATCH /api/friend', () => {

    })

    describe('DELETE /api/friend', () => {

    })
});