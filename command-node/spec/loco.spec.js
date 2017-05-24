let Loco = require("../loco");
let events = require("events");
let Z21 = require("./helpers/mock-z21");

describe("loco", () => {
    let z21, loco, emit;
    beforeEach(() => {
        z21 = new Z21();
        loco = new Loco(z21, 3);
        emit = spyOn(loco, "emit").and.callThrough();
    });
    it("should emit when cs emits", () => {

        const expected = {
            type: "loco",
            address: 3,
            direction: "forward",
            speed: 74,
            speedSteps: 128,
            functions: {
                "lights": true,
            }
        };
        z21.emit("message", expected);

        expect(emit.calls.mostRecent().args[1]).toEqual(expected);
    })
     it("only emits on own address", () => {

        const expected = {
            type: "loco",
            address: 4,
            direction: "forward",
            speed: 74,
            speedSteps: 128,
            functions: {
                "lights": true,
            }
        };
        z21.emit("message", expected);

        expect(emit).not.toHaveBeenCalled();
    })
})