const bcrypt = require('bcryptjs')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('User Endpoints', function () {
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

  /**
   * @description Register a user and populate their fields
   **/
  describe(`POST /api/user`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers))

    const requiredFields = ['username', 'password', 'name']

    requiredFields.forEach(field => {
      const registerAttemptBody = {
        username: 'test username',
        password: 'test password',
        name: 'test name',
      }

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete registerAttemptBody[field]

        return supertest(app)
          .post('/api/user')
          .send(registerAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          })
      })
    })

    it(`responds 400 'Password be longer than 8 characters' when empty password`, () => {
      const userShortPassword = {
        username: 'test username',
        password: '1234567',
        name: 'test name',
      }
      return supertest(app)
        .post('/api/user')
        .send(userShortPassword)
        .expect(400, { error: `Password be longer than 8 characters` })
    })

    it(`responds 400 'Password be less than 72 characters' when long password`, () => {
      const userLongPassword = {
        username: 'test username',
        password: '*'.repeat(73),
        name: 'test name',
      }
      return supertest(app)
        .post('/api/user')
        .send(userLongPassword)
        .expect(400, { error: `Password be less than 72 characters` })
    })

    it(`responds 400 error when password starts with spaces`, () => {
      const userPasswordStartsSpaces = {
        username: 'test username',
        password: ' 1Aa!2Bb@',
        name: 'test name',
      }
      return supertest(app)
        .post('/api/user')
        .send(userPasswordStartsSpaces)
        .expect(400, { error: `Password must not start or end with empty spaces` })
    })

    it(`responds 400 error when password ends with spaces`, () => {
      const userPasswordEndsSpaces = {
        username: 'test username',
        password: '1Aa!2Bb@ ',
        name: 'test name',
      }
      return supertest(app)
        .post('/api/user')
        .send(userPasswordEndsSpaces)
        .expect(400, { error: `Password must not start or end with empty spaces` })
    })

    it(`responds 400 error when password isn't complex enough`, () => {
      const userPasswordNotComplex = {
        username: 'test username',
        password: '11AAaabb',
        name: 'test name',
      }
      return supertest(app)
        .post('/api/user')
        .send(userPasswordNotComplex)
        .expect(400, { error: `Password must contain one upper case, lower case, number and special character` })
    })

    it(`responds 400 'User name already taken' when username isn't unique`, () => {
      const duplicateUser = {
        username: testUser.username,
        password: '11AAaa!!',
        name: 'test name',
      }
      return supertest(app)
        .post('/api/user')
        .send(duplicateUser)
        .expect(400, { error: `Username already taken` })
    })

    describe(`Given a valid user`, () => {
      it(`responds 201, serialized user with no password`, () => {
        const newUser = {
          username: 'test username',
          password: '11AAaa!!',
          name: 'test name',
        }
        return supertest(app)
          .post('/api/user')
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id')
            expect(res.body.username).to.eql(newUser.username)
            expect(res.body.name).to.eql(newUser.name)
            expect(res.body).to.not.have.property('password')
            expect(res.headers.location).to.eql(`/api/user/${res.body.id}`)
          })
      })

      it(`stores the new user in db with bcryped password`, () => {
        const newUser = {
          username: 'test username',
          password: '11AAaa!!',
          name: 'test name',
        }
        return supertest(app)
          .post('/api/user')
          .send(newUser)
          .expect(res =>
            db
              .from('user')
              .select('*')
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.username).to.eql(newUser.username)
                expect(row.name).to.eql(newUser.name)

                return bcrypt.compare(newUser.password, row.password)
              })
              .then(compareMatch => {
                expect(compareMatch).to.be.true
              })
          )
      })
    })
  })

  describe(`GET /api/user/`, () =>{
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers))

    it('returns all users, but only their username and name and id', () =>{
      return supertest(app)
      .get('/api/user')
      .expect(200)
      .expect(res =>{
        expect(res.body[0]).to.have.keys('username', 'name', 'id')
        testUsers.forEach((user, index) =>{
          user = res.body[index];
          expect(user).to.have.property('username', testUsers[index].username);
          expect(user).to.have.property('name', testUsers[index].name);
        });
      });
    })
  })

  describe('GET /api/user/:id', () =>{
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers))

    it('returns 404 if userid is invalid', () =>{
      return supertest(app)
      .get('/api/user/99')
      .expect(404);
    })

    it('only returns user 1s username, name, description and phone#', () =>{
      return supertest(app)
      .get('/api/user/1')
      .expect(200)
      .expect(res =>{
        expect(res.body).to.have.keys('username', 'name', 'description', 'phone');
        expect(res.body).to.have.property('username', testUsers[0].username);
        expect(res.body).to.have.property('name', testUsers[0].name);
        expect(res.body).to.have.property('description', testUsers[0].description);
        expect(res.body).to.have.property('phone', testUsers[0].phone);

      })
    })
  })

  describe.skip('GET /api/user/search', () =>{
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers))
    it('returns 200 and users if theyre username exists', () =>{
      let result = []
      for(let i =0; i < testUsers.length; i++){
        const obj = {
          id: testUsers[i].id,
          name: testUsers[i].name,
          username: testUsers[i].username
        }
        result.push(obj);
      }
      return supertest(app)
      .post('/api/user/search')
      .send({username: 'test-'})
      .expect(200)
      .expect(result);
    })
  })
})
