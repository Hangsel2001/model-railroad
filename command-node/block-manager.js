"use strict";
let events = require("events");
let blocks = [{
        name: "Inner Left",
        enter: 3,
        in: 4
    },
    {
        name: "Outer Left",
        enter: 5,
        in: 2
    },
    {
        name: "Outer Right",
        enter: 6,
        in: 8
    },
    {
        name: "Inner Right",
        enter: 7,
        in: 9
    },
    {
        name: "Center",
        enter: {
            forward: 1,
            backwards: 0
        },
        in: {
            forward: 0,
            backwards: 1
        }
    }
]

class BlockManager extends events.EventEmitter {
    constructor(z21, sensors, loco) {
        super();
        this.z21 = z21;
        this.sensors = sensors;
        this.loco = loco;
        this.blocks = blocks;
        this.direction = loco.direction;
        sensors.on("change", (data) => {
            if (data.active === true) {
                for (let i = 0; i < this.blocks.length; i++) {
                    let current = this.blocks[i];
                    let enter = current.enter[this.direction] || current.enter;
                    let stop = current.in[this.direction] || current.in;
                    if (data.address === current.enter) {
                        current.status = "entering";

                    } else if (data.address === current.in) {
                        current.status = "in";
                    } else {
                        current.status = undefined;
                    }
                    if (current.status !== undefined) {
                        this.emit("status", {
                            name: current.name,
                            status: current.status
                        })
                    }
                }
            }
        })
    }

}

module.exports = BlockManager;