# generator-serverless-service [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> A scaffold for a nodejs Serverless service

## Prerequisites
This project relies on [Yeoman](http://yeoman.io), [direnv](http://direnv.net/) and a Node version manager.

First, install [Yeoman](http://yeoman.io)

```bash
npm install -g yo
```

Second, install [direnv](http://direnv.net/). OSX users can install direnv using [Homebrew](http://brew.sh/)
```bash
brew install direnv
```

Add the following line to your `.bash_profile`

```bash
eval "$(direnv hook bash)"
```

Third, install [nvm](https://github.com/creationix/nvm) or [n](https://www.npmjs.com/package/n)

```bash
npm install -g n
```

## Installation

```bash
npm install -g generator-serverless-service
```

## Usage

```bash
yo serverless-service:aws-nodejs
```

## Project Stucture

```
|_ src
  |_ index.js      // put handlers here
  |_ index.test.js // jest tests
  |_ package.json  // save lambda dependencies here
|_ .editorconfig
|_ .eslintignore
|_ .eslintrc.yml   // eslint config
|_ .gitignore
|_ .node-version   // set node version to 6.10.2
|_ .travis.yml     // deploy project with travis
|_ README.md
|_ package.json
|_ serverless.yml  // configure your serverless service
```

## License

MIT © [A Cloud Guru](https://acloud.guru/)


[npm-image]: https://badge.fury.io/js/generator-serverless-service.svg
[npm-url]: https://npmjs.org/package/generator-serverless-service
[travis-image]: https://travis-ci.org/ACloudGuru/generator-serverless-service.svg?branch=master
[travis-url]: https://travis-ci.org/ACloudGuru/generator-serverless-service
[daviddm-image]: https://david-dm.org/ACloudGuru/generator-serverless-service.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/ACloudGuru/generator-serverless-service
[coveralls-image]: https://coveralls.io/repos/ACloudGuru/generator-serverless-service/badge.svg
[coveralls-url]: https://coveralls.io/r/ACloudGuru/generator-serverless-service
