'use strict';

const path = require('path');

const srcRequire = function(name) {
  const requirePath = path.resolve(__dirname, '../src', name)
  return require(requirePath);
}

if(!global.srcRequire) {
  global.srcRequire = srcRequire;
}

module.exports = srcRequire;
