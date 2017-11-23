
const config = require('../config');
const mysql = require('../../public/mysql')(config.mysql);
const log = require('../../public/log')({
    level : config && config.debug?LOG_LEVEL.DEBUG : LOG_LEVEL.INFO,
    stack_size : config && config.log && config.log.stack_size ? config.log.stack_size : 3,
    bstack : config && config.debug?true:false,
});
const tools = require('../../public/tools')();

const TABALE_NAME = "users";

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
        let self = this;
        mysql.exec(`show tables like '${TABALE_NAME}'`,function(err,res){
            if(err){
                log.fatal(`mysql show table '${TABALE_NAME}' fail:${JSON.stringify(err)}`);
                process.exit(0);
            }else{
                if(res.length == 0){
                    let sql = `create table ${TABALE_NAME}(
                            id int(11) auto_increment primary key,
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
                self._cache = {};
                mysql.exec(`select * from ${TABALE_NAME};`,function(err,res){
                    if(err){
                        log.fatal(`init ${TABALE_NAME} mysql err:${JSON.stringify(err)}`);
                        process.exit(0);
                    }else{
                        for(let u of res){
                            self._tocache(u);
                        }
                        log.info(`init ${TABALE_NAME} info complete.`);
                    }
                });
            }
        });
        self.__INIT_INTERFACE();
    }

    _tochae(u){
        if(u && u.phone){
            this._cache[u.phone] = u;
        }
    }
    __INIT_INTERFACE(){
        let self = this;
        if(self._interface){
            return;
        }
        self._interface = new Map();
        self._interface.set(`/:phone`,{
            //body err
            get : function(cb,p,body){//浏览
                let user = self.get(p.phone);
                if(!user){
                    let err = {
                        code : API_CODE.fail,
                        message : 'unknown user'
                    };
                    cb(err,err.message);
                    return;
                }
                cb(user,null);
            },
            post : function(cb,p,body){//插入
                body.phone = p.phone;
                self.add(body,function(err){
                    if(err){
                        cb({
                            code : API_CODE.fail,
                            message : err
                        },err);
                        return;
                    }
                    cb({code : 0}); 
                });
            },
            put : function(cb,p,body){//更新
                body.phone = p.phone;
                self.udpate(body,function(err){
                    if(err){
                        cb({
                            code : API_CODE.fail,
                            message : err
                        },err);
                        return;
                    }
                    cb({code : 0}); 
                });
            },
            del : function(cb,p,body){//删除
                self.del(p.phone,function(err){
                    if(err){
                        cb({
                            code : API_CODE.fail,
                            message : err
                        },err);
                        return;
                    }
                    cb({code : 0}); 
                });
            }
        });
    }
    __GETALL(){
        return this._cache;
    }

    get(phone){
        return this._cache[phone] ? this._cache[phone] : null; 
    }

    del(phone,callback){
        if(!phone){
            callback('missing params');
            return;
        }
        if(!this.get(phone)){
            callback('unkown user');
            return;
        }
        var sql = `delete from ${TABLE_NAME} where phone=${mysql.escape(phone)};`;
        mysql.exec(sql,function(err){
            if(err){
                callback(`user.del db err:${JSON.stringify(err)};sql:${sql}`);
                return;
            }
            callback();
        });
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

        if(this.get(info.phone)){
            callback('phone already reg');
            return;
        }

        if(info.state !== undefined && !IS_USER_STATE(info.state)){
            callback('invalid user state');
            return;
        }

        let now = info.now || new Date().getTime();
        
        let keys = `(phone,password,nickname,reg_time`;
        let values = `('${mysql.escape(info.phone)}','${mysql.escape(info.password)}','${mysql.escape(info.nickname)}',${info.now}`;
        if(info.state !== undefined){
            keys += `,state`;
            values += `,${mysql.escape(info.state)}`;
        }
        if(info.blogin){
            keys += `,last_login_time`;
            values += `,${now}`;
        }
        if(info.email){
            keys += `,email`;
            values += `,'${mysql.escape(info.email)}'`;
        }
        if(info.idcard){
            keys += `,idcard`;
            values += `,'${mysql.escape(info.idcard)}'`;
        }
        if(info.bauth){
            keys += `,auth_time`;
            values += `,'${now}'`;
        }
        let sql = `insert into ${TABLE_NAME}${keys}) values${values});`;
        let self = this;
        mysql.exec(sql,function(err){
            if(err){
                callback(`mysql err:${JSON.stringify(err)}`);
                return;
            }
            mysql.exec(`select * from ${TABLE_NAME} where phone=${info.phone};`,function(err,res){
                if(err){
                    log.warn('user.add for db err:'+JSON.stringify(err)+';sql:'+sql);
                    self._tochae(info);
                }else if(!res || !res.length){
                    log.warn('user.add for db fail:res is null,'+JSON.stringify(res));
                    self._tochae(info);
                }else{
                    self._tochae(res[0]);
                }
                callback();
            });
        });
    }

    update(info){
        if(!info || !info.phone){
            callback('missing parmas');
            return;
        }
        let user = this.get(info.phone);
        if(!user){
            callback('unkwon phone of user');
            return;
        }

        let sql = null;
        let now = info.now || new Date().getTime();
        if(info.state !== undefined && info.state !== user.state){
            if(!IS_USER_STATE(info.state)){
                callback('invalid user state');
                return;
            }
            sql = `update ${TABLE_NAME} set state=${info.state}`;
        }

        if(info.phone && info.phone !== user.phone){
            if(!sql){
                sql = `update ${TABLE_NAME} set phone='${info.phone}'`;
            }else{
                sql += `,phone='${info.phone}'`;
            }
        }

        if(info.password && info.password !== user.password){
            if(!sql){
                sql = `update ${TABLE_NAME} set password='${info.password}'`;
            }else{
                sql += `,password='${info.password}'`;
            }
        }

        if(info.blogin){
            if(!sql){
                sql = `update ${TABLE_NAME} set last_login_time=${now}`;
            }else{
                sql += `,last_login_time=${now}`;
            }
        }

        if(info.nickname && info.nickname !== user.nickname){
            if(!sql){
                sql = `update ${TABLE_NAME} set nickname=${info.nickname}`;
            }else{
                sql += `,nickname=${info.nickname}`;
            }
        }

        if(info.email && info.email !== user.email){
            if(!sql){
                sql = `update ${TABLE_NAME} set email=${info.email}`;
            }else{
                sql += `,email=${info.email}`;
            }
        }

        if(info.idcard && info.idcard !== user.idcard){
            if(!sql){
                sql = `update ${TABLE_NAME} set idcard=${info.idcard}`;
            }else{
                sql += `,idcard=${info.idcard}`;
            }
        }
        
        if(!user.auth_time && info.auth_time && info.auth_time !== user.auth_time){
            if(!sql){
                sql = `update ${TABLE_NAME} set auth_time=${info.auth_time}`;
            }else{
                sql += `,auth_time=${info.auth_time}`;
            }
        }
        
        if(!sql){
            callback();
            return;
        }

        sql += ` where phone=${info.phone};`

        mysql.exec(sql,function(err){
            if(err){
                log.warn(`user.update db err:${JSON.stringify(err)};sql:${sql}`);
                callback('update fail');
            }else{
                callback();
            }
        });
    }
}

var __instance = null;
if(__instance === null){
    __instance = new User();
}
module.exports = __instance._interface;

