#!/bin/bash

yarn cpx README.md packages/blitz/

sed -i '' 's/name\": \"next\"/name\": \"@blitzjs\/next\"/' nextjs/packages/next/package.json

sed -i '' 's/next\": \"/next\": \"npm:@blitzjs\/next@/' packages/core/package.json
