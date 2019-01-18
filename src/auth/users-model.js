'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('./roles-model.js');

const SINGLE_USE_TOKENS = !!process.env.SINGLE_USE_TOKENS;
const TOKEN_EXPIRE = process.env.TOKEN_LIFETIME || '5m';
const SECRET = process.env.SECRET || 'foobar';

const usedTokens = new Set();

const users = new mongoose.Schema({
  username: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  email: {type: String},
  role: {type: String, default:'user', enum: ['admin','editor','user']},
}, { toObject:{virtuals:true}, toJSON:{virtuals:true} });
// not functioning
users.virtual('acl', {
  ref: 'roles',
  localField: 'role',
  foreignField: 'role',
  justOne:true,
});

users.pre('findOne', function() {
  try {
    this.populate('acl');
  }
  catch(e) {
    throw new Error(e.message);
  }
});



users.pre('save', function(next) {
  bcrypt.hash(this.password, 10)
    .then(hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch(error => {throw new Error(error);});
});

/**
 *
 * Finds a user by email
 * @param {*} email
 * @returns {object} the user object, found or created in database
 */
users.statics.createFromOauth = function(email) {

  if(! email) { return Promise.reject('Validation Error'); }

  return this.findOne( {email} )
    .then(user => {
      if( !user ) { throw new Error('User Not Found'); }
      return user;
    })
    .catch( error => {
      let username = email;
      let password = 'none';
      return this.create({username, password, email});
    });

};

/**
 *
 * Parses the token, reject if token is in set, otherwise add to token to the set
 * @param {*} token
 * @returns {object} the user object, based on the parsedToken id
 */
users.statics.authenticateToken = function(token) {
  
  if ( usedTokens.has(token ) ) {
    return Promise.reject('Invalid Token');
  }
  
  try {
    let parsedToken = jwt.verify(token, SECRET);
    (SINGLE_USE_TOKENS) && parsedToken.type !== 'key' && usedTokens.add(token);
    let query = {_id: parsedToken.id};
    return this.findOne(query);
  } catch(e) { throw new Error('Invalid Token'); }
  
};

/**
 *
 * Checks if the password in the same
 * @param {*} auth
 * @returns {object} the user object if the passwords is the same
 */
users.statics.authenticateBasic = function(auth) {
  let query = {username:auth.username};
  return this.findOne(query)
    .then( user => user && user.comparePassword(auth.password) )
    .catch(error => {throw error;});
};

/**
 *
 * Checks if the password is valid by using bycrpt compare when user signin
 * @param {*} password
 * @returns {boolean} true if password is valid
 */
users.methods.comparePassword = function(password) {
  return bcrypt.compare( password, this.password )
    .then( valid => valid ? this : null);
};

/**
 *
 * Sets type of token object to 'user' or type if provided
 * Adds capabilites array to the token object
 * @param {String} type
 * @returns {string} token that has been encrypted with jwt 
 */
users.methods.generateToken = function(type) {
  console.log(`This.acl: ${this.acl}`);
  let token = {
    id: this._id,
    capabilities: this.acl.capabilities,
    type: type || 'user',
  };
  
  console.log('token', token);

  let options = {};
  if ( type !== 'key' && !! TOKEN_EXPIRE ) { 
    options = { expiresIn: TOKEN_EXPIRE };
  }
  
  return jwt.sign(token, SECRET, options);
};

/**
 *
 * @methods
 * @param {*} capability
 * @returns {boolean} based on if the capability is in capabilities array
 */
users.methods.can = function(capability) {
  // console.log(`This.acl: ${this.acl}`);
  return this.acl.capabilities.includes(capability);
};

/**
 *
 *
 * @returns {}
 */
users.methods.generateKey = function() {
  return this.generateToken('key');
};

module.exports = mongoose.model('users', users);
