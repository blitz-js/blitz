#!/bin/bash

yarn uncommitted

# sed -i '' 's/name\": \"next\"/name\": \"@blitzjs\/next\"/' nextjs/packages/next/package.json
# This step is reverted in package.json#scripts#postpublish
# git update-index --assume-unchanged nextjs/packages/next/package.json
