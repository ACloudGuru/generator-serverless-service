'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-serverless-service:aws-nodejs', function () {
  const props = {
    serviceName: 'test-service',
    awsProfile: 'aws-profile',
    awsRegion: 'us-blah-2',
    awsAccountId: '123456'
  };

  before(function () {
    return helpers.run(path.join(__dirname, '../generators/aws-nodejs'))
      .withPrompts(props)
      .toPromise();
  });

  it('creates files', function () {
    assert.file([
      'src/index.js',
      'src/package.json',
      'test/integration/index.js',
      'test/unit/index.js',
      'test/.eslintrc',
      'test/index.js',
      'test/src-require.js',
      '.editorconfig',
      '.env-deploy',
      '.env-dev',
      '.envrc',
      '.eslintignore',
      '.eslintrc.yml',
      '.gitignore',
      '.node-version',
      '.travis.yml',
      'deploy.sh',
      'event.json',
      'package.json',
      'README.md',
      'serverless.yml'
    ]);
  });
});
