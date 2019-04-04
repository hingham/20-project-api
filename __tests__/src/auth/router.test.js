'use strict';

process.env.SECRET = 'test';

const jwt = require('jsonwebtoken');
const util = require('util');

const Roles = require('../../../src/auth/roles-model.js');
const server = require('../../../src/app.js').server;
const supergoose = require('../../supergoose.js');

const mockRequest = supergoose.server(server);

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

beforeAll(async (done) => {
  await supergoose.startDB();
  const admin = await new Roles(roles.admin).save();
  const editor = await new Roles(roles.editor).save();
  const user = await new Roles(roles.user).save();
  done()
});


afterAll(supergoose.stopDB);

describe('Auth Router', () => {
  
  Object.keys(users).forEach( userType => {
    
    describe(`${userType} users`, () => {
      
      let encodedToken;
      let id;
      
      it('can create one', () => {
        return mockRequest.post('/signup')
          .send(users[userType])
          .then(results => {
            var token = jwt.verify(results.text, process.env.SECRET);
            id = token.id;
            encodedToken = results.text;
            expect(token.id).toBeDefined();
            expect(token.capabilities).toBeDefined();
          });
      });

      it('can signin with basic', () => {
        return mockRequest.post('/signin')
          .auth(users[userType].username, users[userType].password)
          .then(results => {
            // console.log('the text from results', results.text);
            var token = jwt.verify(results.text, process.env.SECRET);
            expect(token.id).toEqual(id);
            expect(token.capabilities).toBeDefined();
          });
      });

      it('can signin with bearer', () => {
        return mockRequest.post('/signin')
          .set('Authorization', `Bearer ${encodedToken}`)
          .then(results => {
            var token = jwt.verify(results.text, process.env.SECRET);
            expect(token.id).toEqual(id);
            expect(token.capabilities).toBeDefined();
          });
      });


      // it('can add a new role', () => {
      //   let obj = {role: 'tester', capabilities:['test']};

      //   return Roles.post(obj)
      //     .then(record => {
      //       Object.keys(obj).forEach(key =>{
      //         expect(record[key]).toEqual(obj[key]);
      //       })
      //     });
      // });

      it('can add a new role', () => {
        let obj = {role: 'tester', capabilities:['test']};

        return mockRequest.post('/newrole')
        .send(obj)
          .then(record => {
            console.log('role text', record.text);
            console.log('json parse 1', JSON.parse(record.text).role);
            let returnedRole = JSON.parse(record.text).role;

            expect(returnedRole).toEqual(obj.role);
          
          });
      });


    });
    
  });
  
});