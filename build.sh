#!/bin/bash

source=src
target=target
if [ -d target ]; then
    rm -rf $target
fi
mkdir $target

for file in "*.py" "*.yaml" "static" "images" "templates"
do
    cp -r $source/$file $target
done

mkdir ${target}/js
python jscompile.py $source/js/json2.js $source/js/boxes.js $source/js/bsp-tree.js $source/js/spiral-layout.js $source/js/scrwall.js > $target/js/scrwall-min.js
python jscompile.py $source/js/json2.js > $target/js/json2-min.js

prodfiles=`ls -1 target/templates/*.prod`
for file in $prodfiles
do
    mv $file `echo "$file" | sed -e "s/\.prod//" `
done

