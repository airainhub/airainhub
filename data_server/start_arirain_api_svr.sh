while [ true ]; do
	mkdir -p Log
	nohup ./node_v8.9.0_x64 arirain_api_main.js &> Log/`date +%Y-%m-%d-%H-%M-%S`'.out' &
	wait
	sleep 2
done