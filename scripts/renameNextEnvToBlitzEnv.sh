#!/bin/sh

set -e

# FROM https://stackoverflow.com/a/56282862
git ls-files -s \*next.config.js \
  | sed -r 's,([^ ]* )(.*)next\-env\.d\.ts,0 \2next-env.d.ts\n\1\2blitz-env.d.ts,' \
  | git update-index --index-info

newtree=`git write-tree`
git read-tree @
git read-tree -u --reset @ $newtree

