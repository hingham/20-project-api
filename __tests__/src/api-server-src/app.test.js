'use strict';

const rootDir = process.cwd();
const supergoose = require('./supergoose.js');
const {server} = require(`${rootDir}/src/app.js`);
const Roles = require(`${rootDir}/src/auth/roles-model.js`);

const mockRequest = supergoose.server(server);

beforeAll(supergoose.startDB);
afterAll(supergoose.stopDB);


let users = {
  admin: {username: 'admin', password: 'password', role: 'admin'},
  editor: {username: 'editor', password: 'password', role: 'editor'},
  user: {username: 'user', password: 'password', role: 'user'},
};

let roles = {
  admin: {role: 'admin', capabilities:['create','read','update','delete']},
  editor: {role: 'editor', capabilities:['create','read','update']},
  user: {role: 'user', capabilities:['read']},
};


// beforeAll(async (done) => {
//   await supergoose.startDB();
//   const admin = await new Roles(roles.admin).save();
//   const editor = await new Roles(roles.editor).save();
//   const user = await new Roles(roles.user).save();
//   done()
// });

// afterAll(supergoose.stopDB);

describe('api server', () => {

  it('should respond with a 404 on an invalid route', () => {

    return mockRequest
      .get('/foo')
      .then(results => {
        expect(results.status).toBe(404);
      });

  });

  it('should respond with a 404 on an invalid method', () => {

    return mockRequest
      .post('/api/v1/notes/12')
      .then(results => {
        expect(results.status).toBe(404);
      });

  });

  xit('should respond properly on request to /api/v1/teams', () => {

    return mockRequest
      .get('/api/v1/teams')
      .auth(users.admin.username, users.admin.password)
      .then(results => {
        expect(results.status).toBe(200);
      });

  });

  xit('should be able to post to /api/v1/teams', () => {

    let obj = {name:'test'};

    return mockRequest
      .post('/api/v1/teams')
      .send(obj)
      .then(results => {
        expect(results.status).toBe(200);
        expect(results.body.title).toEqual(obj.title);
      });

  });

  xit('should be able to post to /api/v1/players', ()  => {

    let obj = {name:'John',team:'Bunnies'};

    return mockRequest
      .post('/api/v1/players')
      .send(obj)
      .then(results => {
        expect(results.status).toBe(200);
        expect(results.body.team).toEqual(obj.team);
      });

  });


  xit('following a post to players, should find a single record', () => {

    let obj = {name:'John',team:'Bunnies'};

    return mockRequest
      .post('/api/v1/players')
      .send(obj)
      .then(results => {
        return mockRequest.get(`/api/v1/players/${results.body._id}`)
          .then(list => {
            expect(list.status).toBe(200);
            expect(list.body.team).toEqual(obj.team);
          });
      });

  });

});
