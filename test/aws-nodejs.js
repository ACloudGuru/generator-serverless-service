'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-serverless-service:aws-nodejs', function() {
  this.timeout(1000 * 10)

  const generatorPath = path.join(__dirname, '../generators/aws-nodejs');
  const baseProps = {
    serviceName: 'test-service',
    awsProfile: 'aws-profile',
    awsRegion: 'us-blah-2',
    useSnyk: false,
    useMocha: false,
    useEslint: false
  };
  const baseFiles = [
    'src/index.js',
    'src/package.json',
    'test/integration/index.js',
    'test/unit/index.js',
    'test/index.js',
    'test/src-path.js',
    'test/src-require.js',
    '.editorconfig',
    '.env-deploy-dev',
    '.env-production',
    '.env-staging',
    '.gitignore',
    '.node-version',
    '.travis.yml',
    'deploy.sh',
    'event.json',
    'install.sh',
    'package.json',
    'README.md',
    'serverless.yml'
  ];
  const esLintFiles = [
    'test/.eslintrc',
    '.eslintignore',
    '.eslintrc.yml'
  ];

  describe('with useSnyk', () => {
    before(() => helpers
          .run(generatorPath)
          .withPrompts(Object.assign(baseProps, {
            useSnyk: true
          }))
          .toPromise()
    );

    it('creates files', () => {
      assert.file(baseFiles);
      assert.noFile(esLintFiles);
    });
  });

  describe('with useMocha', () => {
    before(() => helpers
          .run(generatorPath)
          .withPrompts(Object.assign(baseProps, {
            useMocha: true
          }))
          .toPromise()
    );

    it('creates files', () => {
      assert.file(baseFiles);
      assert.noFile(esLintFiles);
    });
  });

  describe('with useEslint', () => {
    before(() => helpers
          .run(generatorPath)
          .withPrompts(Object.assign(baseProps, {
            useEslint: true
          }))
          .toPromise()
    );

    it('creates files', () => {
      const withEsLintFiles = baseFiles.concat(esLintFiles);
      assert.file(withEsLintFiles);
    });
  });
});
