#!/bin/sh
pid=`ps -ef|grep -i arirain_api_main.js |grep -v "grep"|awk '{print $2}'`
echo "restart pid:$pid"
kill $pid