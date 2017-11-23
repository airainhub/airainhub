
const mysql = require('mysql');
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
				callback(err);
				if(conn){
					conn.release();
				}
				return;
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
