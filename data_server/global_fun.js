
global.HTTP_USER_IP = function (req) {
    if(!req){
        return null;
    }
    if(req.headers && req.headers['x-forwarded-for']){
        return req.headers['x-forwarded-for'];
    }
    if(req.connection && req.connection.remoteAddress){
        return req.connection.remoteAddress;
    }
    if(req.socket && req.socket.remoteAddress){
        return req.socket.remoteAddress;
    }
    if(req.connection && req.connection.socket && req.connection.socket.remoteAddress){
        return req.connection.socket.remoteAddress;
    }
    return null;
};