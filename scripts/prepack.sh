#!/bin/bash

yarn cpx README.md packages/blitz/

# Rename nextjs package so we can publish as @blitzjs/next
sed -i '' 's/name\": \"next\"/name\": \"@blitzjs\/next\"/' nextjs/packages/next/package.json

# Also change next dependency name in blitz core
sed -i '' 's/next\": \"/next\": \"npm:@blitzjs\/next@/' packages/core/package.json
