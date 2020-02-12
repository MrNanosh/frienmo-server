const jwt = require('jsonwebtoken')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Auth Endpoints', function () {
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
                    expect(res.body).to.have.length(1);
                    expect(res.body[0]).to.have.keys('user_id', 'friend_id', 'accepted')
                    expect(res.body[0]).to.have.property('user_id', 1)
                    expect(res.body[0]).to.have.property('friend_id', 2)
                    expect(res.body[0]).to.have.property('accepted', true)
                })
        })
    })

    describe('POST /api/friend', () => {
        beforeEach('insert users, favors, friends, etc', () =>
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
            const friendToFriend = {
                friend_id: 3
            }
            const friendReturn = {
                user_id: 2,
                friend_id: 3,
                accepted: true
            }
            return supertest(app)
                .post('/api/friend')
                .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
                .send(friendToFriend)
                .expect(201)
                .expect(friendReturn)
                .expect(res => {
                    db.select('*').from('friend').where('user_id', 3)
                        .then(result => {
                            expect(result[1]).to.have.keys('user_id', 'friend_id', 'accepted')
                            expect(result[1]).to.have.property('user_id', 3)
                            expect(result[1]).to.have.property('friend_id', 2)
                            expect(result[1]).to.have.property('accepted', false)
                        })
                })
        })
    })

    describe('PATCH /api/friend/:id', () => {
        beforeEach('insert users, favors, friends, etc', () =>
            helpers.seedUsersFavor(
                db,
                testUsers,
                favor,
                outstanding,
                review,
                friend
            )
        )
        it('it updates the accepted property to true', () => {
            const friendToConfirm = {
                friend_id: 1
            }
            return supertest(app)
                .patch('/api/friend/1')
                .set('Authorization', helpers.makeAuthHeader(testUsers[2]))
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.keys('user_id', 'friend_id', 'accepted')
                    expect(res.body).to.have.property('user_id', 3)
                    expect(res.body).to.have.property('friend_id', 1)
                    expect(res.body).to.have.property('accepted', true)
                })
        })
    })

    describe('DELETE /api/friend/:id', () => {
        beforeEach('insert users, favors, friends, etc', () =>
            helpers.seedUsersFavor(
                db,
                testUsers,
                favor,
                outstanding,
                review,
                friend
            )
        )
        it('it deletes the friendship', () => {
            return supertest(app)
                .delete('/api/friend/1')
                .set('Authorization', helpers.makeAuthHeader(testUsers[2]))
                .expect(201)
                .expect(() => {
                    return db.select('*').from('friend')
                        .then(res => {
                            expect(res).to.have.length(2)
                            expect(res[0]).to.have.keys('user_id', 'friend_id', 'accepted')
                            expect(res[0]).to.have.property('user_id', 1)
                            expect(res[0]).to.have.property('friend_id', 2)
                            expect(res[0]).to.have.property('accepted', true)
                            expect(res[1]).to.have.keys('user_id', 'friend_id', 'accepted')
                            expect(res[1]).to.have.property('user_id', 2)
                            expect(res[1]).to.have.property('friend_id', 1)
                            expect(res[1]).to.have.property('accepted', true)
                        })
                })
        })
    })
});