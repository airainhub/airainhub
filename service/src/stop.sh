#!/bin/sh

daemon_pid=`ps -ef|grep -i start_arirain_api_svr.sh |grep -v "grep"|awk '{print $2}'`
pid=`ps -ef|grep -i arirain_api_main.js |grep -v "grep"|awk '{print $2}'`
echo "stop ctl daemon_pid:$daemon_pid,pid:$pid"
kill $daemon_pid
kill $pid