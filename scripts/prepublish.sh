#!/bin/bash

yarn uncommitted

sed -i '' 's/name\": \"next\"/name\": \"@blitzjs\/next\"/' nextjs/packages/next/package.json
git update-index --assume-unchanged nextjs/packages/next/package.json
