var events = require('events');
describe("framework tests", () => {
    describe("buffer", () => {
        it("equals other buffer", () => {
            expect(new Buffer([13, 15, 1])).toEqual(new Buffer([13, 15, 1]));            
        })
    });
});

