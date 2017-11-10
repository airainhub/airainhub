const log = require('../log')();
console.log('level:',log._level);
log.debug(1);
log.info(2);
log.warn(3);
log.error(4);
log.fatal(5);