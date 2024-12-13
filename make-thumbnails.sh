#!/bin/bash

mkdir -p target
i=0
find files/ -iname *.jpg -or -iname *.jpeg | while read filename; do
  target=thumbnails/`basename $filename`
  if [ ! -f $target ]; then
    convert "$filename" -resize 224x224^^ -gravity center -extent 224x224 -quality 65 "$target"
    jhead -q -autorot -purejpg "$target"
  fi
  if [ -f $target ]; then
    echo $target $filename
  fi
  i=$((i+1))
done
