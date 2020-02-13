const jwt = require('jsonwebtoken');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Favor Endpoints', function() {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];
  const arr = helpers.makeUsersAndFavors();
  const favor = arr[0];
  const review = arr[1];
  const friend = arr[2];
  const outstanding = arr[3];

  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  after('disconnect from db', () =>
    db.destroy()
  );

  before('cleanup', () =>
    helpers.cleanTables(db)
  );

  afterEach('cleanup', () =>
    helpers.cleanTables(db)
  );

  beforeEach('insert users', () =>
  helpers.seedUsersFavor(
    db,
    testUsers,
    favor,
    outstanding,
    review,
    friend
  )
);

describe('/ route', () =>{
  describe('GET /api/favor', () => {

    it('it returns all favors marked public for all users', () => {

      return supertest(app)
        .get('/api/favor')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200)
        .expect(res => {
          expect(res.body).to.have.keys('favors', 'page', 'limit');
          expect(res.body.favors).to.deep.equal([{
            category: null,
            creator_id: 2,
            creator_name: 'Test user 2',
            creator_username: 'test-user-2',
            description: 'description 2',
            expiration_date: null,
            id: 2,
            issuer_id: 2,
            issuer_name: 'Test user 2',
            issuer_username: 'test-user-2',
            limit: null,
            outstanding_id: 2,
            posted: null,
            publicity: 'public',
            receiver_id: 1,
            receiver_name: 'Test user 1',
            receiver_username: 'test-user-1',
            tags: null,
            title: 'title 2',
            user_location: null
          }]);
          expect(res.body).to.have.property('page', 1);
          expect(res.body).to.have.property('limit', 30);
        });
    });
  });
  describe('POST /api/favor', () =>{})
})

describe('/:id route', () =>{
  describe('GET /api/favor/:id', () => {
    it('returns the specified favor', () =>{
      const expectedFavor ={
        id: 1,
        title: 'title 1',
        description: 'description 1',
        creator_id: 1
      }
      return supertest(app)
      .get('/api/favor/1')
      .set(
        'Authorization',
        helpers.makeAuthHeader(
          testUser
        )
      )
      .expect(200)
      .expect(expectedFavor)
    })
  });
  describe('PATCH /api/favor/:id', () =>{});
  describe('DELETE /api/favor/:id', () =>{});
})

  describe('GET /api/favor/friend', () => {
    it('gets favors that were posted by friends and only friends', () =>{
      return supertest(app)
      .get('/ai/favor/friend')
      .set(
        'Authorization',
        helpers.makeAuthHeader(
          testUser
        )
      )
      .expect(200)
      .expect({hello: 'hello'});
    })
  });

  describe('GET /api/favor/personal', () => {});

  describe('GET /api/favor/public', () => {});

  describe('POST api/favor/issue', () => {});

  describe('PATCH api/favor/redeem/:favor_id', () => {});

  describe('POST /api/friend', () => {
    it('makes a new friend request with one accepted and the other unaccepted', () => {
      const friendToFriend = {
        friend_id: 3
      };
      const friendReturn = {
        user_id: 2,
        friend_id: 3,
        accepted: true
      };
      return supertest(app)
        .post('/api/friend')
        .set(
          'Authorization',
          helpers.makeAuthHeader(
            testUsers[1]
          )
        )
        .send(friendToFriend)
        .expect(201)
        .expect(friendReturn)
        .expect(res => {
          db.select('*')
            .from('friend')
            .where('user_id', 3)
            .then(result => {
              expect(
                result[1]
              ).to.have.keys(
                'user_id',
                'friend_id',
                'accepted'
              );
              expect(
                result[1]
              ).to.have.property(
                'user_id',
                3
              );
              expect(
                result[1]
              ).to.have.property(
                'friend_id',
                2
              );
              expect(
                result[1]
              ).to.have.property(
                'accepted',
                false
              );
            });
        });
    });
  });

  describe('PATCH /api/friend/:id', () => {
    it('it updates the accepted property to true', () => {
      const friendToConfirm = {
        friend_id: 1
      };
      return supertest(app)
        .patch('/api/friend/1')
        .set(
          'Authorization',
          helpers.makeAuthHeader(
            testUsers[2]
          )
        )
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.keys(
            'user_id',
            'friend_id',
            'accepted'
          );
          expect(
            res.body
          ).to.have.property(
            'user_id',
            3
          );
          expect(
            res.body
          ).to.have.property(
            'friend_id',
            1
          );
          expect(
            res.body
          ).to.have.property(
            'accepted',
            true
          );
        });
    });
  });

  describe('DELETE /api/friend/:id', () => {
    it('it deletes the friendship', () => {
      return supertest(app)
        .delete('/api/friend/1')
        .set(
          'Authorization',
          helpers.makeAuthHeader(
            testUsers[2]
          )
        )
        .expect(201)
        .expect(() => {
          return db
            .select('*')
            .from('friend')
            .then(res => {
              expect(
                res
              ).to.have.length(2);
              expect(
                res[0]
              ).to.have.keys(
                'user_id',
                'friend_id',
                'accepted'
              );
              expect(
                res[0]
              ).to.have.property(
                'user_id',
                1
              );
              expect(
                res[0]
              ).to.have.property(
                'friend_id',
                2
              );
              expect(
                res[0]
              ).to.have.property(
                'accepted',
                true
              );
              expect(
                res[1]
              ).to.have.keys(
                'user_id',
                'friend_id',
                'accepted'
              );
              expect(
                res[1]
              ).to.have.property(
                'user_id',
                2
              );
              expect(
                res[1]
              ).to.have.property(
                'friend_id',
                1
              );
              expect(
                res[1]
              ).to.have.property(
                'accepted',
                true
              );
            });
        });
    });
  });
});
