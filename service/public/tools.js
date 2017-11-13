/*
 * @author 	xzl
 * @data	2016-7-26 15:22
 * @file	global_tools.js
 * @工具函数整合
 */
const log = require('./log')();
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

Date.prototype.pattern = function(fmt) {         
	let o = {         
		"M+" : this.getMonth()+1, //月份         
		"d+" : this.getDate(), //日         
		"h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时         
		"H+" : this.getHours(), //小时         
		"m+" : this.getMinutes(), //分         
		"s+" : this.getSeconds(), //秒         
		"q+" : Math.floor((this.getMonth()+3)/3), //季度         
		"S" : this.getMilliseconds() //毫秒         
	};         
	let week = {         
		"0" : "/u65e5",         
		"1" : "/u4e00",         
		"2" : "/u4e8c",         
		"3" : "/u4e09",         
		"4" : "/u56db",         
		"5" : "/u4e94",         
		"6" : "/u516d"        
	};         
	if(/(y+)/.test(fmt)){         
	    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));         
	}         
	if(/(E+)/.test(fmt)){         
	    fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);         
	}         
	for(let k in o){         
	    if(new RegExp("("+ k +")").test(fmt)){         
	        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));         
        }         
    }         
    return fmt;         
}

class tools {
	constructor(tag){
		this.tag = tag;
	}
	is_ip (ip){
		if(typeof ip !== "string"){
			return false;
		}
		let tmp = ip.split('.');
		if(tmp.length !== 4){
			return false;
		}
		for(let i of tmp){
			if(Number(i) < 0 || Number(i) > 255){
				return false;
			}
		}
		return true;
	}

	is_empty_obj (obj){
		if(typeof obj !== "object"){
			return false;
		}
		for(let i in obj){
			return true;
		}
		return false;
	}
	
	is_array(obj){
		return Object.prototype.toString.call(obj) === '[object Array]';
	}

	get_json_parse (json_str){
		try{
			let json = JSON.parse(json_str);
			return json;
		}catch(e){
			return false;
		}
	}

	md5(str){
		return crypto.createHash('md5').update(str,'utf8').digest('hex');
	}

	timestamp_format(time){
		return (new Date(time)).pattern("yyyy-MM-dd HH:mm:ss");
	}

	curr_time(format_str,times){
		let time = new Date();
		if(times !== undefined){
			time = new Date(time.getTime()+Number(times));
		}
		return time.pattern(format_str ? format_str : "yyyy-MM-dd HH:mm:ss");
	}

	save_json_to_dir(dir,filename,json,callback){
		try{
			let dir_ = './'+dir+'/';
			let path_str = dir_+filename+'.json';
			//同步
			if (!fs.existsSync(dir_)) {
				fs.mkdirSync(dir_);
			}
			fs.writeFileSync(path_str,JSON.stringify(json));
			callback();
		}catch(e){
			callback(e);
		}
	}

	get_json_by_jsonflie(dir,filename,callback){
		try{
			let path_str = dir+ '/' +filename+'.json';
			if (fs.existsSync(dir)) {
				let res_str = fs.readFileSync(path_str);
				callback(get_json_parse(res_str));
			}else{
				callback('not found file');
			}
		}catch(e){
			callback(e);
		}
	}

	quick_sort(arr,key,is_asc) {
		let self = this;
		if (arr.length <= 1) { return arr; }
		let pivotIndex = Math.floor(arr.length / 2);
		let pivot = arr.splice(pivotIndex, 1)[0];
		let left = [];
		let right = [];
		let sort_fun = function(s1,s2){
			return is_asc ? s1 > s2 : s1 < s2;
		};
		for (let i = 0; i < arr.length; i++){
		
			if(key != undefined && arr[i][key] != undefined){
				if (sort_fun(arr[i][key],pivot[key])) {
					left.push(arr[i]);
				}else {
					right.push(arr[i]);
				}
			}else{
				if (sort_fun(arr[i],pivot)) {
					left.push(arr[i]);
				}else {
					right.push(arr[i]);
				}
			}
		}
		return self.quick_sort(left,key,is_asc).concat([pivot], self.quick_sort(right,key,is_asc));
	}
}

var _instance = null;
module.exports = function(){
	if(_instance === null){
		_instance = new tools();
	}
	return _instance;
};
