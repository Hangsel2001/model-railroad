var events = require('events');
var merge = require('merge');
describe("framework tests", () => {
    describe("buffer", () => {
        it("equals other buffer", () => {
            expect(new Buffer([13, 15, 1])).toEqual(new Buffer([13, 15, 1]));            
        })
    });
    describe("merge", ()=>{
        it ("overwrites", ()=>{
let a = {a:"a"};
        let b= {a:"b", b:"b"};
        expect(merge(a,b)).toEqual({a:"b", b:"b"});
        });
        
    });
});

