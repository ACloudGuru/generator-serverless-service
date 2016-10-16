'use strict';
var path = require('path');
var generators = require('yeoman-generator');

const required = (str) => str.length > 0;

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);
  },

  initializing: function () {
    this.props = {};
  },

  prompting: function () {
    return this.prompt([
      {
        name: 'serviceName',
        message: 'Your service name',
        default: path.basename(process.cwd()),
        validate: required
      },
      {
        type: 'String',
        name: 'awsProfile',
        message: 'AWS Profile Name?',
        default: 'default',
        validate: required
      },
      {
        type: 'String',
        name: 'awsRegion',
        message: 'AWS Region?',
        default: 'us-east-1',
        validate: required
      },
      {
        type: 'String',
        name: 'awsAccountId',
        message: 'AWS Account Id?'
      },
    ])
    .then(function (props) {
      this.props = props;
    }.bind(this));
  },

  writing: function () {
    this.fs.copy(this.templatePath('src/**'), this.destinationPath('src'));
    this.fs.copy(this.templatePath('src-package.json'), this.destinationPath('src/package.json'));

    this.fs.copy(this.templatePath('test/**'), this.destinationPath('test'));
    this.fs.copy(this.templatePath('test/.*'), this.destinationPath('test'));

    const rootFiles = [
      '.editorconfig',
      '.envrc',
      '.eslintignore',
      '.eslintrc.yml',
      '.gitignore',
      '.node-version',
      '.travis.yml',
      'deploy.sh',
      'event.json',
    ];

    rootFiles.forEach((function(path) {
      this.fs.copy(this.templatePath(path), this.destinationPath(path));
    }).bind(this));

    const rootTemplates = {
      '.template-env-deploy': '.env-deploy',
      '.template-env-dev': '.env-dev',
      'package.json': '',
      'README.md': '',
      'serverless.yml': ''
    };
    const rootTemplateKeys = Object.keys(rootTemplates);

    rootTemplateKeys.forEach((function(path) {
      const dest = rootTemplates[path] || path;
      this.fs.copyTpl(this.templatePath(path), this.destinationPath(dest), this.props);
    }).bind(this));
  },

  install: function () {
    this.installDependencies({ bower: false });

    this.spawnCommand('direnv', ['allow', this.destinationRoot()]);
  }
});
