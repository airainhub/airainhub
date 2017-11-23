const tools = require('../tools')();
const should = require('should');
describe('tools模块', function() {
    describe('tools.is_ip', function() {
        it("有效ip",function(){
            should(tools.is_ip("114.244.23.15")).be.equal(true);            
        });
        it("无效ip1",function(){
            should(tools.is_ip("114.278.23.15")).be.equal(false);            
        });
        it("无效ip2",function(){
            should(tools.is_ip("114.278.23")).be.equal(false);            
        });
        it("错误数值",function(){
            should(tools.is_ip(1)).be.equal(false);            
        });
        it("undefined数值",function(){
            should(tools.is_ip()).be.equal(false);            
        });
        it("null数值",function(){
            should(tools.is_ip(null)).be.equal(false);            
        });
    });
    describe('tools.is_empty_obj', function() {
        it("数值对象",function(){
            should(tools.is_empty_obj({a:123})).be.equal(true);            
        });
        it("空对象",function(){
            should(tools.is_empty_obj({})).be.equal(false);            
        });
        it("undefined数值",function(){
            should(tools.is_empty_obj()).be.equal(false);            
        });
        it("null数值",function(){
            should(tools.is_empty_obj(null)).be.equal(false);            
        });
    });
});
