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
    useEslint: false,
    useDirenv: false
  };
  const baseFiles = [
    'src/index.js',
    'src/package.json',
    '.editorconfig',
    '.gitignore',
    '.node-version',
    '.travis.yml',
    'package.json',
    'README.md',
    'serverless.yml'
  ];
  const esLintFiles = [
    '.eslintignore',
    '.eslintrc.yml'
  ];

  const jestFiles = [
    'src/index.test.js'
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
  describe('with useMocha', () => {
    before(() => helpers
          .run(generatorPath)
          .withPrompts(Object.assign(baseProps, {
            useJest: true
          }))
          .toPromise()
    );

    it('creates files', () => {
      const withJestFiles = baseFiles.concat(jestFiles);
      assert.file(withJestFiles);
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
