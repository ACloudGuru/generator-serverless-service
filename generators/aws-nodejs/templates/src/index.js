'use strict';

module.exports.handler = (event, context, cb) => {
  cb(null, { message: 'Horray! You ran a function!' });
};
