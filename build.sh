#!/bin/bash
echo "typescript..."
tsc -p tsconfig.esm.json 
mv lib/esm/index.js lib/esm/index.mjs
tsc -p tsconfig.cjs.json

mkdir -p lib/src
cp ./changelog.txt lib
cp ./README.md lib
cp ./license.md lib

echo "less..."
mkdir -p lib/styles 
lessc src/x4.less >lib/styles/x4.css 
cp src/x4.less lib/styles/x4.less

