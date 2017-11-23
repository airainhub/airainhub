
const fs = require('fs');
class api {
    constructor(config,done){
        this._dir = config.dir || "./apis";
        // this._list = [];
        // this._info = new Map();
        this._init(done);
    }

    _init(done){
        var self = this;
        fs.readdir(self._dir,function(err,files){
            if(err){
                throw new Error("base api read dir file list fail");
            }
            for(let f of files){
                let f_ = f.split('.')[0];
                let m = require(self._dir+'/'+f_);
                for(let [r,o] of m){
                    for(let t in o){
                        done(t,`/${f_}${r}`,o[t]);
                    }
                }
            }
        });
    }
}

module.exports = function(config,done){
    return new api(config,done);
};