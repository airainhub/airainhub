
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