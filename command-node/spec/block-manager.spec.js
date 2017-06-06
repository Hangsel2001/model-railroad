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
        }];
        z21 = new Z21();
        sensors = new events.EventEmitter();
        loco = new Loco(z21, 3);
        loco.setDirection("backwards");
        manager = new BlockManager(sensors, [loco], blocks);
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
    });

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