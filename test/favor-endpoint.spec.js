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
                limit: null,
                outstanding_id: 1,
                posted: null,
                publicity: 'public',
                receiver_id: 2,
                receiver_name: 'Test user 2',
                receiver_username: 'test-user-2',
                tags: null,
                title: 'title 1',
                user_location: null
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
                user_location: null
              }]);
            expect(res.body).to.have.property('page', 1);
            expect(res.body).to.have.property('limit', 30);
          });
      });
    });
    describe('POST /api/favor', () => {
      it('it returns 201 and the right information',() => {
        const newFavor = {
          id: 3,
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
          .expect(async () =>{
            let outCheck
            let favorCheck = await db.select('*').from('favor').where('id', 3).first();
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
      it('returns the specified favor', () => {
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
            limit: null,
            outstanding_id: 1,
            posted: null,
            publicity: 'public',
            receiver_id: 2,
            receiver_name: 'Test user 2',
            receiver_username: 'test-user-2',
            tags: null,
            title: 'title 1',
            user_location: null
          }
        return supertest(app)
          .get('/api/favor/1')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(expectedFavor)
      })
    });
    describe('PATCH /api/favor/:id', () => {
      it('properly updates the limit', () =>{
        let updates = {
          limit: 2000000001
        }
        return supertest(app)
        .patch('/api/favor/1')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(updates)
        .expect(201)
        .expect(async () =>{
          let favorCheck = await db.select('*').from('favor').where('id', 1).first();
          expect(favorCheck).to.have.property('limit', 2000000001)
        })
      })

      it('properly updates the expiration date', () =>{
        const date = new Date();
        let updates = {
          expiration_date: date
        }
        return supertest(app)
        .patch('/api/favor/1')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(updates)
        .expect(201)
        .expect(async () =>{
          let favorCheck = await db.select('*').from('favor').where('id', 1).first();
          let test = new Date(favorCheck.expiration_date).toLocaleString();
          expect(test).to.eql(date.toLocaleString())
        });
      });
     });
    describe('DELETE /api/favor/:id', () => { });
  })

  describe('GET /api/favor/friend', () => {
    it('gets favors that were posted by friends and only friends', () => {
     /* return supertest(app)
        .get('/ai/favor/friend')
        .set(
          'Authorization',
          helpers.makeAuthHeader(
            testUser
          )
        )
        .expect(200)
        .expect({ hello: 'hello' });*/
    })
  });

  describe('GET /api/favor/personal', () => { });

  describe('GET /api/favor/public', () => { });

  describe('POST api/favor/issue', () => { });

  describe('PATCH api/favor/redeem/:favor_id', () => { });

});
