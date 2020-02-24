const jwt = require('jsonwebtoken');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Favor Endpoints', function () {
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

  describe('/ route', () => {
    describe('GET /api/favor', () => {

      it('it returns all favors marked public for all users', () => {
        return supertest(app)
          .get('/api/favor')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body).to.have.keys('favors', 'page', 'limit');
            expect(res.body.favors).to.deep.equal([
              {
                category: null,
                creator_id: 1,
                creator_name: 'Test user 1',
                creator_username: 'test-user-1',
                description: 'description 1',
                expiration_date: new Date(favor[0].expiration_date).toISOString(),
                id: 1,
                issuer_id: 1,
                issuer_name: 'Test user 1',
                issuer_username: 'test-user-1',
                limit: favor[0].limit,
                outstanding_id: 1,
                posted: null,
                publicity: 'public',
                receiver_id: 2,
                receiver_name: 'Test user 2',
                receiver_username: 'test-user-2',
                tags: null,
                title: 'title 1',
                user_location: null,
                issuer_redeemed: true,
                receiver_redeemed: true
              },
              {
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
                user_location: null,
                issuer_redeemed: false,
                receiver_redeemed: true
              }]);
            expect(res.body).to.have.property('page', 1);
            expect(res.body).to.have.property('limit', 30);
          });
      });
      it('properly filters recieved requests', () => {
        return supertest(app)
          .get('/api/favor?filter=received')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body).to.have.keys('favors', 'page', 'limit');
            expect(res.body.favors).to.deep.equal([
              {
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
                user_location: null,
                issuer_redeemed: false,
                receiver_redeemed: true
              }]);
          })
      })
      it('properly filters issued requests', () => {
        return supertest(app)
          .get('/api/favor?filter=issued')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body).to.have.keys('favors', 'page', 'limit');
            expect(res.body.favors).to.deep.equal([
              {
                category: null,
                creator_id: 1,
                creator_name: 'Test user 1',
                creator_username: 'test-user-1',
                description: 'description 1',
                expiration_date: new Date(favor[0].expiration_date).toISOString(),
                id: 1,
                issuer_id: 1,
                issuer_name: 'Test user 1',
                issuer_username: 'test-user-1',
                limit: favor[0].limit,
                outstanding_id: 1,
                posted: null,
                publicity: 'public',
                receiver_id: 2,
                receiver_name: 'Test user 2',
                receiver_username: 'test-user-2',
                tags: null,
                title: 'title 1',
                user_location: null,
                issuer_redeemed: true,
                receiver_redeemed: true
              }]);
          })
      })
      it('properly filters redeemed requests', () => {
        return supertest(app)
          .get('/api/favor?filter=redeemed')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body).to.have.keys('favors', 'page', 'limit');
            expect(res.body.favors).to.deep.equal([])
          });
      })
      it('properly filters expired requests', () => {
        return supertest(app)
          .get('/api/favor?filter=expired')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body).to.have.keys('favors', 'page', 'limit');
            expect(res.body.favors).to.deep.equal([])
          });
      })
      it('properly filters pendingrequests', () => {
        return supertest(app)
          .get('/api/favor?filter=expired')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body).to.have.keys('favors', 'page', 'limit');
            expect(res.body.favors).to.deep.equal([])
          });
      })
    });
    describe('POST /api/favor', () => {
      it('it returns 201 and the right information', () => {
        const newFavor = {
          id: 6,
          title: 'newFavor',
          description: 'its news',
          creator_id: 1,
          expiration_date: new Date(favor[0].expiration_date).toISOString(),
          publicity: 'public',
          user_location: '',
          tags: '',
          category: 1,
          limit: 20,
          posted: null
        }
        return supertest(app)
          .post('/api/favor')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(newFavor)
          .expect(201)
          .expect(async res => {
            let outCheck
            let favorCheck = await db.select('*').from('favor').where('id', 6).first();
            //console.log(favorCheck);
            //let outCheck = await db.select('*').from('outstanding').where('favor_id', 3).first();
            //console.log(outCheck);
            //check if the database for favor is right, and outstanding is right

            //insert checks here
          });
      })
    })
  })

  describe('/:id route', () => {
    describe('GET /api/favor/:id', () => {
      const expectedFavor = {
        category: null,
        creator_id: 1,
        creator_name: 'Test user 1',
        creator_username: 'test-user-1',
        description: 'description 1',
        expiration_date: new Date(favor[0].expiration_date).toISOString(),
        id: 1,
        issuer_id: 1,
        issuer_name: 'Test user 1',
        issuer_username: 'test-user-1',
        limit: favor[0].limit,
        outstanding_id: 1,
        posted: null,
        publicity: 'public',
        receiver_id: 2,
        receiver_name: 'Test user 2',
        receiver_username: 'test-user-2',
        tags: null,
        title: 'title 1',
        user_location: null,
        issuer_redeemed: true,
        receiver_redeemed: true
      }
      it('returns the specified favor', () => {

        return supertest(app)
          .get('/api/favor/1')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect([expectedFavor])
      })
      it('returns an empty array after filtering received', () => {
        return supertest(app)
          .get('/api/favor/1?filter=received')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect([])
      })
      it('returns the expected favor after filtering issued', () => {
        return supertest(app)
          .get('/api/favor/1?filter=issued')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect([expectedFavor])
      })
      it('returns expected favor after filtering redeemed', () => {
        it('returns an empty array after filtering received', () => {
          return supertest(app)
            .get('/api/favor/1?filter=received')
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .expect(200)
            .expect([expectedFavor])
        })
      })
    });
    describe('PATCH /api/favor/:id', () => {
      it('properly updates the limit', () => {
        let updates = {
          limit: 2000000001
        }
        return supertest(app)
          .patch('/api/favor/1')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(updates)
          .expect(204)
          .expect(async () => {
            let favorCheck = await db.select('*').from('favor').where('id', 1).first();
            expect(favorCheck).to.have.property('limit', 2000000001)
          })
      })

      it('properly updates the expiration date', () => {
        const date = new Date();
        let updates = {
          expiration_date: date
        }
        return supertest(app)
          .patch('/api/favor/1')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(updates)
          .expect(204)
          .expect(async () => {
            let favorCheck = await db.select('*').from('favor').where('id', 1).first();
            let test = new Date(favorCheck.expiration_date).toLocaleString();
            expect(test).to.eql(date.toLocaleString())
          });
      });
    });
    describe('DELETE /api/favor/:id', () => {
      it('deletes the favor from the database', () => {
        return supertest(app)
          .delete('/api/favor/1')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(204)
          .expect(async () => {
            let favorless = await db.select('*').from('favor').where('id', 1).first()
            expect(!favorless)
          })
      })
    });
  })

  describe('GET /api/favor/friend', () => {
    it('gets favors that were posted by friends and only friends', () => {
      let date = new Date(favor[0].expiration_date).toISOString();
      return supertest(app)
        .get('/api/favor/friend')
        .set(
          'Authorization',
          helpers.makeAuthHeader(
            testUser
          )
        )
        .expect(200)
        .expect({
          favors: [
            {
              favor_id: 3,
              title: 'title 3',
              description: 'description 3',
              category: null,
              expiration_date: new Date(favor[0].expiration_date).toISOString(),
              publicity: 'friend',
              user_location: null,
              tags: null,
              limit: 2,
              outstanding_id: 3,
              receiver_redeemed: true,
              issuer_redeemed: true,
              creator_id: 1,
              creator_name: 'Test user 1',
              creator_username: 'test-user-1',
              issuer_id: 1,
              issuer_name: 'Test user 1',
              issuer_username: 'test-user-1',
              receiver_id: 2,
              receiver_name: 'Test user 2',
              receiver_username: 'test-user-2'
            },
            {
              favor_id: 4,
              title: 'title 4',
              description: 'description 4',
              category: null,
              expiration_date: null,
              publicity: 'friend',
              user_location: null,
              tags: null,
              limit: null,
              outstanding_id: 4,
              receiver_redeemed: true,
              issuer_redeemed: false,
              creator_id: 2,
              creator_name: 'Test user 2',
              creator_username: 'test-user-2',
              issuer_id: 2,
              issuer_name: 'Test user 2',
              issuer_username: 'test-user-2',
              receiver_id: 1,
              receiver_name: 'Test user 1',
              receiver_username: 'test-user-1'
            }
          ],
          limit: 30,
          page: 1
        });
    })
  }); //returns each favor correctly, but twice, I assume its an issue with the join method but not sure how to fix
  //update: i think i fixed it but check with Dana to make sure it works right 

  describe('GET /api/favor/personal', () => {
    it('gets favors with the publicity of dm', () => {
      return supertest(app)
        .get('/api/favor/personal')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200)
        .expect({
          favors: [{
            favor_id: 5,
            title: 'title 5',
            description: 'description 5',
            category: null,
            expiration_date: null,
            publicity: 'dm',
            user_location: null,
            tags: null,
            limit: null,
            outstanding_id: 5,
            receiver_redeemed: true,
            issuer_redeemed: true,
            creator_id: 5,
            creator_name: 'Test user 5',
            creator_username: 'test-user-5',
            issuer_id: 1,
            issuer_name: 'Test user 1',
            issuer_username: 'test-user-1',
            receiver_id: 2,
            receiver_name: 'Test user 2',
            receiver_username: 'test-user-2'
          }],
          limit: 30,
          page: 1
        })
    })
  });

  describe('GET /api/favor/public', () => {
    it('gets favors that were posted by friends and only friends', () => {
      return supertest(app)
        .get('/api/favor/friend')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200)
        .expect({
          favors: [
            {
              favor_id: 3,
              title: 'title 3',
              description: 'description 3',
              category: null,
              expiration_date: new Date(favor[0].expiration_date).toISOString(),
              publicity: 'friend',
              user_location: null,
              tags: null,
              limit: 2,
              outstanding_id: 3,
              receiver_redeemed: true,
              issuer_redeemed: true,
              creator_id: 1,
              creator_name: 'Test user 1',
              creator_username: 'test-user-1',
              issuer_id: 1,
              issuer_name: 'Test user 1',
              issuer_username: 'test-user-1',
              receiver_id: 2,
              receiver_name: 'Test user 2',
              receiver_username: 'test-user-2'
            },
            {
              favor_id: 4,
              title: 'title 4',
              description: 'description 4',
              category: null,
              expiration_date: null,
              publicity: 'friend',
              user_location: null,
              tags: null,
              limit: null,
              outstanding_id: 4,
              receiver_redeemed: true,
              issuer_redeemed: false,
              creator_id: 2,
              creator_name: 'Test user 2',
              creator_username: 'test-user-2',
              issuer_id: 2,
              issuer_name: 'Test user 2',
              issuer_username: 'test-user-2',
              receiver_id: 1,
              receiver_name: 'Test user 1',
              receiver_username: 'test-user-1'
            },
          ],
          limit: 30,
          page: 1
        })
    });
  });

  describe('POST api/favor/issue', () => {
    it('updates the user and reciever id if it doesnt exist, otherwise makes a new one', () => {
      const updatedUsers = {
        favor_id: 1,
        users_id: 1,
        receiver_id: 2
      }
      return supertest(app)
        .post('/api/favor/issue')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(updatedUsers)
        .expect(201)
        .expect(async res => {
          let test = await db.select('*').from('outstanding').where('id', outstanding[outstanding.length - 1].id + 1).first();
          expect(test).to.have.property('id', 6)
          expect(test).to.have.property('favor_id', updatedUsers.favor_id)
          expect(test).to.have.property('users_id', updatedUsers.users_id)
          expect(test).to.have.property('receiver_id', updatedUsers.receiver_id)
          expect(test).to.have.property('receiver_redeemed', false)
          expect(test).to.have.property('giver_redeemed', false)
        });
    })
  });

  describe.only('PATCH api/favor/redeem/:favor_id', () => {

    it('updates the favor properly', () => {
      return supertest(app)
        .patch('/api/favor/redeem/2')
        .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
        .send({ outstanding_id: 2 })
        .expect(204)
    })
  });

  describe('GET api/favor/count/:id', () => {
    it('returns the right number', () => {
      return supertest(app)
        .get('/api/favor/count/1')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200)
        .expect({ remaining: 1 })
    })
  })

});
