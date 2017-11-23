#!/bin/sh

b_rm=0
if [ $# -gt 0 ]; then
    b_rm=$1
fi

if [ $# -gt 1 ]; then
    git reset --hard $2
    echo "git reset:$2"
else
	git pull
fi

if [ $b_rm -eq 1 ]; then
    rm -rf Log
fi

./restart.sh