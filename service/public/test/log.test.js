

describe('日志模块测试', function() {
    const log = require('../log')({
        // bstack : false
    });
    //登记测试
    console.log('level:',log._level);
    log.debug(1);
    log.info(2);
    log.warn(3);
    log.error(4);
    log.fatal(5);
    //性能测试
    // setInterval(function(){
    //     let start = new Date();
    //     for(let i = 0 ; i < 100000;i++){
    //         log.info(1);
    //     }
    //     log.info(new Date().getTime() - start.getTime());
    // },1000);
});