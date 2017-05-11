'use strict';

const path = require('path');
const Generator = require('yeoman-generator');
const extend = require('deep-extend');

const required = (str) => str.length > 0;

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.props = {};
  }

  prompting() {
    return this.prompt([
      {
        name: 'serviceName',
        message: 'Your service name',
        default: path.basename(process.cwd()),
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
        name: 'useJest',
        message: 'Would you like to install jest for testing?'
      },
      {
        when: function(response) {
          return this.useJest;
        },
        type: 'confirm',
        name: 'useMocha',
        message: 'Would you like to install mocha, chai, sinon and istanbul for testing?'
      },
      {
        type: 'confirm',
        name: 'useEslint',
        message: 'Would you like to install eslint for linting?'
      },
      {
        type: 'confirm',
        name: 'useSnyk',
        message: 'Would you like to install snyk to detect package vulnerabilities?'
      },
      {
        type: 'confirm',
        name: 'useYarn',
        message: 'Would you like to use yarn instead of npm?'
      },
    ])
    .then((props) => {
      this.props = props;
    });
  }

  writePackageJson() {
    const filePath = 'package.json';
    const pkg = this.fs.readJSON(this.destinationPath(filePath), {});

    if(!pkg.name) pkg.name = this.props.serviceName;

    const serverlessConfig = {
      scripts: {
        "package": "sls package --verbose",
        "deploy": "sls deploy --verbose",
        "deploy:artifact": "sls deploy --verbose",
        "install:all": "yarn install && cd ./src && yarn install"
      },
      devDependencies: {
        "bluebird": "^3.4.6",
        "serverless": "^1.12.1",
        "serverless-plugin-aws-alerts": "^1.0.0",
        "serverless-plugin-crypt": "0.0.1",
        "serverless-plugin-simulate": "^0.0.13",
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

    if(this.props.useJest) {
      extend(pkg, {
        scripts: {
          "lint": "eslint .",
          "lint-fix": "eslint . --fix",
          "test": "jest --coverage",
          "test:watch": "jest --coverage --watch",
        },
        devDependencies: {
          "jest": "^20.0.0",
        },
        jest: {
          coverageThreshold: {
            global: {
              statements: 70,
              branches: 70,
              functions: 70,
              lines: 70,
            },
          },
        },
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
  }

  writeSrcPackageJson() {
    const filePath = 'src/package.json';
    const pkg = this.fs.readJSON(this.destinationPath(filePath), {});

    if(!pkg.name) pkg.name = `${this.props.serviceName}-functions`;

    extend(pkg, {
      dependencies: {}
    });

    this.fs.writeJSON(this.destinationPath(filePath), pkg);
  }

  writing() {
    this.writePackageJson();
    this.writeSrcPackageJson();

    const files = {
      'config/**': 'config',
      'src/index.js': '',
      'editorconfig.template': '.editorconfig',
      'gitignore.template': '.gitignore',
      'node-version.template': '.node-version'
    };

    if(this.props.useEslint) {
      files['eslintignore.template'] = '.eslintignore';
      files['eslintrc.yml.template'] = '.eslintrc.yml';
    }

    if(this.props.useJest) {
      files['src/index.test.js'] = 'src/index.test.js';
    }

    const templates = {
      'README.md': '',
      'serverless.yml': '',
      'travis.yml.template': '.travis.yml'
    };

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
  }

  install() {
    if (this.props.useYarn) {
      this.yarnInstall();
    } else {
      this.npmInstall();
    }
  }
};
