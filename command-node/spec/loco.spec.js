"use strict";

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
    describe("name", () => {
        it("has a name", () => {
            expect(new Loco(z21, 3, "RC5").name).toBe("RC5");
        });
        it("falls back to address", () => {
            expect(loco.name).toBe("3");
        });
    });


    describe("events", () => {
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

            expect(emit.calls.mostRecent().args[1].address).toEqual(expected.address);
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
        it("queries for values on creation", () => {
            let send = spyOn(z21, "send");
            loco = new Loco(z21, 3);
            expect(send).toHaveBeenCalledWith({
                type: "get_loco",
                address: 3
            })
        })
    })
    describe("getters and setters", () => {
        let send;
        beforeEach(() => {
            send = spyOn(z21, "send");
            z21.emit("message", {
                type: "loco",
                address: 3,
                direction: "forward",
                speed: 74,
                speedSteps: 128,
                functions: {
                    "lights": true,
                }
            });
        })
        it("should update local values with new values", () => {
            const input = {
                type: "loco",
                address: 3,
                direction: "forward",
                speed: 74,
                speedSteps: 128,
                functions: {
                    "lights": true,
                }
            };
            z21.emit("message", input);
            expect(loco.speed).toBe(74);
            expect(loco.direction).toBe("forward");
            expect(loco.functions.lights).toBeTruthy();
        })
        it("should update when set", () => {
            loco.setSpeed(50);
            let input = {
                type: "loco_drive",
                address: 3,
                direction: "forward",
                speed: 50,
                speedSteps: 128
            }
            expect(send.calls.mostRecent().args[0]).toEqual(input);
        })
        it("should keep speed when settings direction", () => {
            loco.setDirection("backwards");
            let input = {
                type: "loco_drive",
                address: 3,
                direction: "backwards",
                speed: 74,
                speedSteps: 128
            }
            expect(send.calls.mostRecent().args[0]).toEqual(input);
        })
        it("should get broadcastable copy of loco", () => {
            const actual = loco.getInfo();
            expect(actual).toEqual({
                    name: "3",
                    address : 3,
                    direction: "forward",
                    functions: {lights:true},
                    orientation: "cw",
                    speedSteps: 128,
                    speed: 74
                
            });
        });



    })

})