const config = require('../config');
const mysql = require('../../public/mysql')(config.mysql);
const log = require('../public/log')({
    level : config && config.debug?LOG_LEVEL.DEBUG : LOG_LEVEL.INFO,
    stack_size : config && config.log && config.log.stack_size ? config.log.stack_size : 3,
    bstack : config && config.debug?true:false,
});
const tools = require('../public/tools')();

var TABALE_NAME = "users";

global.USER_STATE = {
    NORMAL :　1,//正常
    FROZEN : 0,//未认证
    DISABLED : -1,//禁用【封号】
    DROP : -2//注销账号
};
global.IS_USER_STATE = function(state){
    if(state === undefined){
        return false;
    }
    for(let k in USER_STATE){
        if(USER_STATE[k] === stats){
            return true;
        }
    }
    return false;
};
class User {
    constructor(){
        mysql.exec(`show tables like '${TABALE_NAME}'`,function(err,res){
            if(err){
                log.fatal(`mysql show table '${TABALE_NAME}' fail:${JSON.stringify(err)}`);
                process.exit(0);
            }else{
                if(res.length == 0){
                    let sql = `create table ${TABALE_NAME}(
                            id int auto_increment primary key,
                            state int default 1,
                            phone varchar(32) not null,
                            password varchar(32) not null,
                            reg_time bigint not null,
                            last_login_time bigint default 0,
                            nickname varchar(32) not null,
                            email varchar(128),
                            idcard varchar(32),
                            auth_time bigint default 0
                        )`;
                    mysql.exec(sql,function(err,res){
                        if(err){
                            log.fatal(`mysql create table '${TABALE_NAME}' fail:${JSON.stringify(err)}`);
                            process.exit(0);
                        }else{
                            log.info(`mysql db create table '${TABALE_NAME}' success`);
                        }
                    });
                    return;
                }
                this._cache = {};
                mysql.exec(`select * from ${TABALE_NAME};`,function(err,res){
                    if(err){
                        log.fatal(`init ${TABALE_NAME} mysql err:${JSON.stringify(err)}`);
                        process.exit(0);
                    }else{
                        for(let u of res){
                            this._tocache(u);
                        }
                        log.info(`init ${TABALE_NAME} info complete.sum:${this.sum}`);
                    }
                });
            }
        });
    }

    _tochae(u){
        if(u && u.id){
            this._cache[u.id] = u;
        }
    }

    _has_phone(p,id){
        for(let u of this._cache){
            if(u.phone === p){
                if(id !== undefined && u.id === id){
                    continue;
                }
                return true;
            }
        }
        return false;
    }

    get(id){
        return this._cache[id] ? this._cache[id] :null; 
    }

    add(info,callback){
        if(!info || !info.phone || !info.password || !info.nickname){
            callback('missing params');
            return;
        }
        if(typeof info.phone !== "string" || typeof info.password !== "string" || typeof info.nickname !== "string"){
            callback('invalid params');
            return;
        }
        if(!tools.is_phone_number(info.phone)){
            callback('invalid phone number');
            return;
        }
        if(this._has_phone(info.phone)){
            callback('phone already reg');
            return;
        }
        if(info.state !== undefined && !IS_USER_STATE(info.state)){
            callback('invalid user state');
            return;
        }
        let now = info.now || new Date().getTime();
        
        let keys = `(phone,password,nickname,reg_time`;
        let values = `('${info.phone}','${info.password}','${info.nickname}',${info.now}`;
        if(info.state !== undefined){
            keys += `,state`;
            values += `,${info.state}`;
        }
        if(info.blogin){
            keys += `,last_login_time`;
            values += `,${now}`;
        }
        if(info.email){
            keys += `,email`;
            values += `,'${info.email}'`;
        }
        if(info.idcard){
            keys += `,idcard`;
            values += `,'${info.idcard}'`;
        }
        if(info.bauth){
            keys += `,auth_time`;
            values += `,'${now}'`;
        }
        let sql = `insert into ${TABLE_NAME}${keys}) values${values});`
        mysql.exec(sql,function(err){
            if(err){
                callback(`mysql err:${JSON.stringify(err)}`);
                return;
            }
            callback();
        });
    }

    update(id,info){
        if(!id || !this.get(id)){
            callback('unkown id');
            return;
        }
        if(!info){
            callback();
            return;
        }
        // id int auto_increment primary key,
        // state int default 1,
        // phone varchar(32) not null,
        // password varchar(32) not null,
        // reg_time bigint not null,
        // last_login_time bigint default 0,
        // nickname varchar(32) not null,
        // email varchar(128),
        // idcard varchar(32),
        // auth_time bigint default 0
        let sql = null;
        let now = info.now || new Date().getTime();
        if(info.state !== undefined){
            if(!IS_USER_STATE(info.state)){
                callback('invalid user state');
                return;
            }
            sql = `update ${TABLE_NAME} set state=${info.state}`;
        }
        if(info.phone){
            if(this._has_phone(info.phone,id)){
                callback('phone already reg');
                return;
            }
            if(!sql){
                sql = `update ${TABLE_NAME} set phone='${info.phone}'`;
            }else{
                sql += `,phone='${info.phone}'`;
            }
        }
        if(info.password){
            if(!sql){
                sql = `update ${TABLE_NAME} set password='${info.password}'`;
            }else{
                sql += `,password='${info.password}'`;
            }
        }
        if(info.reg_time){
            if(!sql){
                sql = `update ${TABLE_NAME} set reg_time=${now}`;
            }else{
                sql += `,reg_time=${now}`;
            }
        }
        if(info.blogin){
            if(!sql){
                sql = `update ${TABLE_NAME} set last_login_time=${now}`;
            }else{
                sql += `,last_login_time=${now}`;
            }
        }
    }
}

var __instance = null;
if(__instance === null){
    __instance = new User();
}

let _ = new Map();
_.set(`/:id`,{
    get : function(cb,params,body){//浏览
        // cb(params,err,code);
        cb(params);
    },
    post : function(cb,params,body){//插入
        cb({test:123});
    },
    put : function(cb,params,body){//更新
        cb(params);
    },
    del : function(cb,params,body){//删除
        cb(params);
    }
});
module.exports = _;

