const mongodb = require('mongoose');
class db {
    constructor(config){
        this._url = `mongodb://${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.dbname}`;
        this.db = mongoose.createConnection(this._url);
        this.db.on('error', function(error) {
            console.log('mongoose db err',error);
        });
    }
}

var _instance = null;
module.exports = function(config){
	if(_instance === null){
		_instance = new db(config);
	}
	return _instance.db;
};