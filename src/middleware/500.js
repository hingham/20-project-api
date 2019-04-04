'use strict';

/**
 * 500 error
 * handles all errors
 * @module src/middleware/500
 */


module.exports = (err, req, res, next) => {
  console.log('__SERVER_ERROR__', err);
  let error = { error: err.message || err };
  res.status(500).json(error);
};
