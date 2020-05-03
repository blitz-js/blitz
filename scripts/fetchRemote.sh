#!/bin/bash

set -e

if [[ $(git remote -v | grep 'upstream' | wc -l) -eq 0 ]]; then
  echo "Upstream remote not found, adding one"
  git remote add upstream https://github.com/blitz-js/blitz.git
fi

git fetch upstream
