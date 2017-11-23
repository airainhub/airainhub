
const mysql = require('mysql');
class mysql_pool {
	constructor(config,log){
		this._pool = mysql.createPool({
			host			:	config.host,
			port			:	config.port,
			user     		: 	config.user,
			password 		: 	config.password,
			database		: 	config.database
		});
		this.log = log?log:null;
	}
	exec(sql,callback){
		let self = this;
		this._pool.getConnection(function(err,conn){
			if(err){
				if(self.log){
					self.log.warn('mysql pool get conn err:'+JSON.stringify(err));
				}else{
					console.log('mysql pool get conn err:'+JSON.stringify(err));
				}
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
module.exports = function(config,log){
	if(_instance === null){
		_instance = new mysql_pool(config,log);
	}
	return _instance;
};
