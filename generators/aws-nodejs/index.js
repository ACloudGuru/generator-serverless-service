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
        type: 'confirm',
        name: 'useDirenv',
        message: 'Would you like to use direnv to load env variables and manage serverless locally?'
      },
      {
        type: 'confirm',
        name: 'useStoredEnvVars',
        message: 'Would you like to store an encrypted copy of your env vars in git?'
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

    const serverlessConfig = {
      scripts: {
        "start": "sls offline",
      },
      devDependencies: {
        "bluebird": "^3.4.6",
        "serverless-offline": "3.1.0",
        "serverless-plugin-package-dotenv-file": "^0.0.1",
        "serverless-run-function-plugin": "^0.0.4",
      }
    };

    if(this.props.useDirenv) {
      serverlessConfig.devDependencies["serverless"] = "^1.0.0";
    }

    extend(pkg, serverlessConfig);

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

    const files = {
      'src/**': 'src',
      'test/**': 'test',
      'editorconfig.template': '.editorconfig',
      'env-production.template': '.env-production',
      'env-staging.template': '.env-staging',
      'event.json': '',
      'gitignore.template': '.gitignore',
      'install.sh': '',
      'node-version.template': '.node-version'
    };

    if(this.props.useDirenv) {
      files['envrc.template'] = '.envrc';
    }

    if(this.props.useEslint) {
      files['test/eslintrc.template'] = 'test/.eslintrc';
      files['eslintignore.template'] = '.eslintignore';
      files['eslintrc.yml.template'] = '.eslintrc.yml';
    }

    const templates = {
      'deploy.sh': '',
      'env-deploy-dev.template': '.env-deploy-dev',
      'README.md': '',
      'serverless.yml': '',
      'travis.yml.template': '.travis.yml'
    };

    if(this.props.useStoredEnvVars) {
      files['create-enc-keys.template'] = 'create-enc-keys.sh';
      files['decrypt-env-vars.template'] = 'decrypt-env-vars.sh';
      files['encrypt-env-vars.template'] = 'encrypt-env-vars.sh';
    }

    const plainCopy = (path, dest) => this.fs.copy(path, dest);
    const templateCopy = (path, dest) => this.fs.copyTpl(path, dest, this.props);
    const iterateFiles = ((files, action) => {
      Object.keys(files).forEach((function(path) {
        const dest = files[path] || path;
        action(this.templatePath(path), this.destinationPath(dest));
      }).bind(this));
    }).bind(this);

    iterateFiles(files, plainCopy);
    iterateFiles(templates, templateCopy);
  },

  install: function () {
    this.installDependencies({ bower: false });

    if(this.props.useDirenv) {
      this.spawnCommand('direnv', ['allow', this.destinationRoot()]);
    }
  }
});
