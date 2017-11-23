const config = require('./config');
const log = require('../public/log')({
    level : config && config.debug?LOG_LEVEL.DEBUG : LOG_LEVEL.INFO,
    stack_size : config && config.log && config.log.stack_size ? config.log.stack_size : 3,
    bstack : config && config.debug?true:false,
});
const mysql = reuqire('mysql');
class mysql_pool {
	constructor(config){
		this._pool = mysql.createPool({
			host			:	config.host,
			port			:	config.port,
			user     		: 	config.user,
			password 		: 	config.password,
			database		: 	config.database
		});
	}
	exec(sql,callback){
		this._pool.getConnection(function(err,conn){
			if(err){
				log.warn('mysql pool get conn err:'+JSON.stringify(err));
			}
			conn.query(/*'select * from play_fluency where user_id=1011'*/sql,function(err,res){
				conn.release();
				if(callback){
					if(err){
						callback(err)
					}else{
						callback(null,res);
					}
				}
			});
		})
	}
	escape(str){
		return mysql.escape(str);
	}
}

var _instance = null;
module.exports = function(config){
	if(_instance === null){
		_instance = new mysql_pool(config);
	}
	return _instance;
};
