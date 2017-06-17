"use strict";

let Z21 = require("./helpers/mock-z21");
let Loco = require("../loco");
let events = require("events");

describe("block manager", () => {
    let BlockManager = require("../block-manager");
    let manager, z21, sensors, loco, blocks;

    beforeEach(() => {
        blocks = [{
            name: "OuterRight",
            ccw: {
                enter: 8,
                in: 6
            }
        }, {
            name: "Middle",
            ccw: {
                enter: 0,
                in: 1
            }
        }, {
            name: "OuterLeft",
            ccw: {
                enter: 3,
                in: 4
            }
        }, {
            name: "t1",
            type: "turnout",
            address: 1
        }];
        z21 = new Z21();
        sensors = new events.EventEmitter();
        loco = new Loco(z21, 3);
        loco.setDirection("backwards");
        manager = new BlockManager(sensors, [loco], blocks, z21);
        manager.setLocoPosition(loco, "OuterRight", "ccw");
    })

    describe("block", () => {
        it("is occupied by start position", () => {
            expect(manager.blocks[0].status).toBe("in");
        })
        it("reserves and expects", () => {
            manager.reserveBlock("Middle", loco);
            expect(manager.blocks[1].status).toBe("reserved");
            toggleSensor(0);
            expect(manager.blocks[1].status).toBe("enter");
            toggleSensor(1);
            expect(manager.blocks[1].status).toBe("in");
        })
        it("is released on exit", () => {
            expect(manager.blocks[0].status).toBe("in");
            manager.reserveBlock("Middle", loco);
            toggleSensor(0);
            expect(manager.blocks[0].status).toBe("exiting");
            toggleSensor(1);
            expect(manager.blocks[0].status).toBeUndefined();
            expect(manager.blocks[0].loco).toBeUndefined();
        });
        it("can't reserve reserved or occupied", () => {
            expect(() => {
                manager.reserveBlock("OuterRight", loco)
            }).toThrow();
            manager.reserveBlock("Middle", loco);
            expect(() => {
                manager.reserveBlock("Middle", loco)
            }).toThrow();
        })
        it("gets block by name", ()=>{
            expect(manager.getBlock("Middle")).toBe(manager.blocks[1]);
        })
    });

    describe ("reserved", ()=> {
        it("emits unexpected on sensor in unexpected block",()=>{
            var spy = jasmine.createSpy("callback");
            manager.on("status", spy);
            toggleSensor(4);
            expect(spy).toHaveBeenCalledWith({name: "OuterLeft", status: "unexpected"});                                    
        });
        it("emits unexpected on wrong sensor in block",()=>{
            var spy = jasmine.createSpy("callback");
            manager.on("status", spy);
            toggleSensor(1);
            expect(spy).toHaveBeenCalledWith({name: "Middle", status: "unexpected"});                                    
        });
    })

    describe("turnouts", ()=> {
        it ("sets turnouts", ()=>{
            var send = spyOn(z21, "send");
            manager.setTurnout("t1", "straight");
            expect(send).toHaveBeenCalledWith({type:"turnout", address: 1, position: "straight", })
        })
    })

    // it("determines block by enter", () => {
    //     sensors.emit("change", {
    //         address: 3,
    //         active: true
    //     });
    //     expect(manager.blocks[0].status).toEqual("entering");
    //     expect(manager.blocks[1].status).not.toBeDefined();
    // })
    function toggleSensor(addr) {
        sensors.emit("change", {
            address: addr,
            active: true
        });
        sensors.emit("change", {
            address: addr,
            active: false
        });
    }
});