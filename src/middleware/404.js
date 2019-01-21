'use strict';


/**
 * 404 error
 * handles all user errors
 * @module src/middleware/404
 */

module.exports = (req,res,next) => {
  let error = { error: 'Resource Not Found' };
  res.status(404).json(error);
};
