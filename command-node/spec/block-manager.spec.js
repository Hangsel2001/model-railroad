"use strict";

let Z21 = require("./helpers/mock-z21");
let Loco = require("../loco");
let events = require("events");

describe("block manager", () => {
    let BlockManager = require("../block-manager");
    let manager, z21, sensors, loco;

    beforeEach(() => {
        z21 = new Z21();
        sensors = new events.EventEmitter();
        loco = new Loco(z21,3);
        loco.setDirection("backwards");
        manager = new BlockManager(z21, sensors, loco);                
    })

    it("determines block by enter", () => {
        sensors.emit("change", {
            address: 3,
            active: true
        });
        expect(manager.blocks[0].status).toEqual("entering");
        expect(manager.blocks[1].status).not.toBeDefined();
    })
});