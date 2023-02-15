#!/bin/bash
echo "less..."
mkdir -p lib/styles 
lessc src/x4.less >lib/styles/x4.css 
cp src/x4.less lib/styles/x4.less

