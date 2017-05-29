let Turnout = require("../turnout");
let events = require("events");
let Z21 = require("./helpers/mock-z21");

describe("turnout", () => {
    let z21, turnout, emit;
    beforeEach(() => {
        z21 = new Z21();
        turnout = new Turnout(z21, 1);
        emit = spyOn(turnout, "emit").and.callThrough();
    });
    describe("events", () => {
        it("should emit when cs emits", () => {

            const expected = {
                type: "turnout",
                address: 1,
                position: "turn",
            };
            z21.emit("message", expected);

            expect(emit.calls.mostRecent().args[1]).toEqual(expected);
        })
        it("only emits on own address", () => {

            const expected = {
                type: "turnout",
                address: 2,
                position: "turn",
            };
            z21.emit("message", expected);

            expect(emit).not.toHaveBeenCalled();
        })
    })
       describe("getters and setters", () => {
        let send;
        beforeEach(() => {
            send = spyOn(z21, "send");
            z21.emit("message", {
                type: "turnout",
                address: 1,
                position: "straight",
            });
        })
        it("should update local values with new values", () => {
            const input = {
                type: "turnout",
                address: 1,
                position: "turn"
            };
            expect(turnout.position).toBe("straight");
            z21.emit("message", input);
            expect(turnout.position).toBe("turn");
        })
        it("should update when set", () => {
            turnout.setPosition("turn");
            const input = {
                type: "turnout",
                address: 1,
                position: "turn"
            };
            expect(send.calls.mostRecent().args[0]).toEqual(input);
        })
       });
});
