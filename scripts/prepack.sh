#!/bin/bash

yarn cpx README.md packages/blitz/

sed -i '' 's/next\": \"/next\": \"npm:@blitzjs\/next@/' packages/core/package.json
