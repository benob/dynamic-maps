#!/bin/bash

dir=`dirname "$0"`
cd "$dir"

if [ ! -d env ]; then
  virtualenv -p python3 env
  . env/bin/activate
  pip install -r requirements.txt
else
  . env/bin/activate
fi

python src/server.py vg_100k


