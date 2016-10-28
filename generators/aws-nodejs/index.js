'use strict';

const path = require('path');
const generators = require('yeoman-generator');
const extend = require('deep-extend');

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
      {
        type: 'confirm',
        name: 'useSnyk',
        message: 'Would you like to install snyk to detect package vulnerabilities?'
      },
      {
        type: 'confirm',
        name: 'useMocha',
        message: 'Would you like to install mocha, chai, sinon and istanbul for testing?'
      },
      {
        type: 'confirm',
        name: 'useEslint',
        message: 'Would you like to install eslint for linting?'
      }
    ])
    .then(function (props) {
      this.props = props;
    }.bind(this));
  },

  writePackageJson: function() {
    const filePath = 'package.json';
    const pkg = this.fs.readJSON(this.destinationPath(filePath), {});

    if(!pkg.name) pkg.name = this.props.serviceName;

    extend(pkg, {
      scripts: {
        "start": "sls offline",
      },
      devDependencies: {
        "bluebird": "^3.4.6",
        "serverless": "^1.0.0",
        "serverless-offline": "3.1.0",
        "serverless-plugin-package-dotenv-file": "^0.0.1",
        "serverless-run-function-plugin": "^0.0.4",
      }
    });

    if(this.props.useMocha) {
      extend(pkg, {
        scripts: {
          "test": "npm run test:all",
          "test:all": "npm run test:unit && npm run test:integration",
          "test:unit": "istanbul cover _mocha test/unit -- -R spec --recursive",
          "test:integration": "mocha test/integration"
        },
        devDependencies: {
          "chai": "^3.5.0",
          "istanbul": "^0.4.5",
          "mocha": "^3.1.2",
          "sinon": "^1.17.6",
        }
      });
    }

    if(this.props.useSnyk) {
      const currentTestScript = pkg.scripts.test;
      const testScript = currentTestScript ? `snyk test && ${currentTestScript}` : 'snyk test';

      extend(pkg, {
        scripts: {
          "test": testScript,
        },
        devDependencies: {
          "snyk": "^1.19.1"
        }
      });
    }

    if(this.props.useEslint) {
      extend(pkg, {
        scripts: {
          "lint": "eslint .",
        },
        devDependencies: {
          "eslint": "^3.8.0",
          "eslint-config-standard": "^6.2.0",
          "eslint-plugin-node": "^2.1.3",
          "eslint-plugin-promise": "^3.0.0",
          "eslint-plugin-standard": "^2.0.1",
        }
      });
    }

    this.fs.writeJSON(this.destinationPath(filePath), pkg);
  },

  writeSrcPackageJson: function() {
    const filePath = 'src/package.json';
    const pkg = this.fs.readJSON(this.destinationPath(filePath), {});

    if(!pkg.name) pkg.name = `${this.props.serviceName}-functions`;

    extend(pkg, {
      dependencies: {
        "dotenv": "^2.0.0"
      }
    });

    this.fs.writeJSON(this.destinationPath(filePath), pkg);
  },

  writing: function () {
    this.writePackageJson();
    this.writeSrcPackageJson();

    if(!this.fs.exis)
    this.fs.copy(this.templatePath('src/**'), this.destinationPath('src'));

    this.fs.copy(this.templatePath('test/**'), this.destinationPath('test'));

    if(this.props.useEslint) {
      this.fs.copy(this.templatePath('test/.eslintrc'), this.destinationPath('test/.eslintrc'));
    }

    const rootFiles = [
      '.editorconfig',
      '.envrc',
      '.gitignore',
      '.node-version',
      '.travis.yml',
      'deploy.sh',
      'event.json',
    ];

    if(this.props.useEslint) {
      rootFiles.push('.eslintignore', '.eslintrc.yml');
    }

    rootFiles.forEach((function(path) {
      this.fs.copy(this.templatePath(path), this.destinationPath(path));
    }).bind(this));

    const rootTemplates = {
      '.template-env-deploy-dev': '.env-deploy-dev',
      '.template-env-production': '.env-production',
      '.template-env-staging': '.env-staging',
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
