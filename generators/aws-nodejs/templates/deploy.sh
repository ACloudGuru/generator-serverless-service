#!/bin/bash
set -e

if [[ $CI == "true" ]]; then
  if [[ $TRAVIS_PULL_REQUEST != "false" ]]; then
    echo "Not deploying changes on pull request";
    exit 0;
  fi

  if [[ $TRAVIS_BRANCH != "master" ]]; then
    echo "Not deploying changes from branch $TRAVIS_BRANCH";
    exit 0;
  fi
fi

if [ -z ${AWS_REGION+x} ]; then
  echo "Please set a region";
  exit 0;
fi

if [ -z ${SERVICE_ENV+x} ]; then
  echo "Please set service environment SERVICE_ENV";
  exit 0;
fi

echo "Deploying to stage $SERVICE_ENV"

# use the serverless version installed in the project
./node_modules/.bin/sls deploy --stage $SERVICE_ENV --region $AWS_REGION --verbose
