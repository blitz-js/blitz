#!/bin/bash

rm -rf examples && git add examples
git checkout --theirs docs && git add docs
git checkout --theirs errors && git add errors
git checkout --theirs packages/next/native && git add packages/next/native
# /compiled/ has already mostly been resolved with custom merge strategy
# but sometimes new files are added, so this will solve that case
git add packages/next/compiled
