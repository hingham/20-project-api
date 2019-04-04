'use strict';

/**
 * Auth router
 * Provides routes for managing users
 * @module src/auth/router
 */

const express = require('express');
const authRouter = express.Router();
// const swaggerUI = require('swagger-ui-express');
const cwd = process.cwd();

const Role = require('./roles-model');

const User = require('./users-model.js');
const auth = require('./middleware.js');


/**
 * @function handleSignup
 * handles user signup
 * @param req {object} Express Request Object
 * @param res {object} Express Response Object
 * @param next {function} Express middleware next()
 */

authRouter.post('/signup', (req, res, next) => {
  let user = new User(req.body);
  user.save()
    .then( (user) => {
      User.findOne({_id: user._id})
        .then(user => {
          // does not have access to the acl
          req.token = user.generateToken();
          req.user = user;
          res.set('token', req.token);
          res.cookie('auth', req.token);
          res.send(req.token);
        });
    })
    .catch(next);
});



/**
 * @function handle newRole
 * handles user signup
 * @param req {object} Express Request Object
 * @param res {object} Express Response Object
 * @param next {function} Express middleware next()
 */
authRouter.post('/newrole', (req, res, next) => {
  let role = new Role(req.body);
  role.save()
    .then(role => {
      res.status(200).send(role);
    })
    .catch(next);
});


/**
 * @function handleSignin
 * handles user signup
 * @param req {object} Express Request Object
 * @param res {object} Express Response Object
 * @param next {function} Express middleware next()
 */

authRouter.post('/signin', auth(), (req, res, next) => {

  res.cookie('auth', req.token);
  res.send(req.token);
});

authRouter.post('/key', auth, (req,res,next) => {
  let key = req.user.generateKey();
  res.status(200).send(key);
});


module.exports = authRouter;
