//global define
require('./global_define');
require('./global_fun');

//pack
const config = require('./config');
const log = require('../public/log')({
    level : config && config.debug?LOG_LEVEL.DEBUG : LOG_LEVEL.INFO,
    stack_size : config && config.log && config.log.stack_size ? config.log.stack_size : 3,
    bstack : config && config.debug?true:false,
});

const restify = require('restify');

const server = restify.createServer({
    name: 'airainhub',
    version: '1.0.0'
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

const API_BASE = require('./api-base')({
    dir : config.apis_dir
},function(t,r,cb){
    let v1r = '/v1'+r;
    let v2r = '/v2'+r;
    server[t](v1r,function (req, res, next) {
        cb(function(body,err){
            if(err){
                log.info(`${HTTP_USER_IP(req)} | ${t} ${v1r} | params:${JSON.stringify(req.params)} | err:${JSON.stringify(err)} | return:[${code?code:200}]${JSON.stringify(body)}`);
            }else{
                log.info(`${HTTP_USER_IP(req)} | ${t} ${v1r} | params:${JSON.stringify(req.params)} | success | return:[${code?code:200}]${JSON.stringify(body)}`);
            }
            res.send(err?API_CODE.error:API_CODE.success,JSON.stringify(body));
            return next();
        },req.params,req.body);
    });
    server[t](v2r,function (req, res, next) {
        cb(function(body,err){
            if(err){
                log.info(`${HTTP_USER_IP(req)} | ${t} ${v2r} | params:${JSON.stringify(req.params)} | err:${JSON.stringify(err)} | return:[${code?code:200}]${JSON.stringify(body)}`);
            }else{
                log.info(`${HTTP_USER_IP(req)} | ${t} ${v2r} | params:${JSON.stringify(req.params)} | success | return:[${code?code:200}]${JSON.stringify(body)}`);
            }
            res.send(err?API_CODE.error:API_CODE.success,JSON.stringify(body));
            return next();
        },req.params,req.body);
    });
});
    
server.listen(config.http.port,config.http.host,function(err){
    if(err){
        log.fatal(`${server.name} listening fail ${config.http.host}:${config.http.port}`)
        process.exit(0);
    }
    log.info(`${server.name} listening at ${server.url}`);
});
