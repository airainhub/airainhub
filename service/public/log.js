const path = require('path');
const util = require('util');
const fs = require('fs');

global.LOG_LEVEL = {
	DEBUG : 1,
	INFO : 2,
	WARN : 3,
	ERROR : 4,
	FATAL : 5
};
global.SYSTEM = process.platform;
global.DEFAULT_STACK_SIZE = 3;

class log {
	constructor(level,stack_size){
		this._level = level || LOG_LEVEL.INFO;
		this._stack_size = stack_size || DEFAULT_STACK_SIZE;
	}

	_init(level,stack_size){
		this._level = level || LOG_LEVEL.DEBUG;
		this._stack_size = stack_size || DEFAULT_STACK_SIZE;
	}

	_stack(){
		let stack_array = (new Error()).stack.split("\n");
		let tmp = '';
		let bhas = false;
		for(let i = 1; i < stack_array.length; i++){
			let str = path.basename(stack_array[i]);
			if(str.indexOf(":") !== -1){
				str = str.substr(0,str.indexOf(':'));
				if( str === path.basename(__filename)){
					bhas = true;
				}else if(bhas){
					tmp = stack_array[i].split(SYSTEM === "win32"?'\\':'/');
					if(tmp.length && tmp.length >= this._stack_size){
						tmp  = tmp.slice(tmp.length - this._stack_size);
						tmp = ['.',...tmp];
					}
					tmp = tmp.join('/');
					tmp = tmp.substr(0,tmp.length-1);
					break;
				}
			}	
		}	
		return tmp;
	}
	
	_levelstr(level){
		switch(level){
			case LOG_LEVEL.FATAL:
				return 'FATAL';
			case LOG_LEVEL.ERROR:
				return 'ERROR';
			case LOG_LEVEL.WARN:
				return 'WARN';
			case LOG_LEVEL.INFO:
				return 'INFO';
			case LOG_LEVEL.DEBUG:
				return 'DEBUG';
			default:
				return 'UNKOWN';
		}
	}

	_format(level, date, msg){
		var timeString = '' + date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + '-' + date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds() + ' ';
		return [timeString, '\t', this._levelstr(level).toUpperCase(), '\t', this._stack(), '\t', msg].join('');
	}

	_write(txt){
		console.log(txt);
	}

	_log(level,msg){
		if(level >= this._level){
			this._write( this._format(level, new Date(), msg));
		}
	}

	fatal(msg){
		this._log(LOG_LEVEL.FATAL, msg);
	}

	error(msg){
		this._log(LOG_LEVEL.ERROR, msg);
	}

	warn(msg){
		this._log(LOG_LEVEL.WARN, msg);
	}

	info(msg){
		this._log(LOG_LEVEL.INFO, msg);
	}

	debug(msg){
		this._log(LOG_LEVEL.DEBUG, msg);
	}
}

var _instance = null;
module.exports = function(level,stack_size){
	if(_instance === null){
		_instance = new log(level,stack_size);
	}else{
		_instance._init(level,stack_size);
	}
	return _instance;
};
