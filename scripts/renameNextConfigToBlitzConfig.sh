#!/bin/sh

set -e

# FROM https://stackoverflow.com/a/56282862
git ls-files -s \*next.config.js \
  | sed -r 's,([^ ]* )(.*)next\.config\.js,0 \2next.config.js\n\1\2blitz.config.js,' \
  | git update-index --index-info

newtree=`git write-tree`
git read-tree @
git read-tree -u --reset @ $newtree

