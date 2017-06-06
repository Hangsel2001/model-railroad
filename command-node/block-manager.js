"use strict";
let events = require("events");
// let blocks = [{
//         name: "Inner Left",
//         enter: 3,
//         in: 4
//     },
//     {
//         name: "Outer Left",
//         enter: 5,
//         in: 2
//     },
//     {
//         name: "Outer Right",
//         enter: 6,
//         in: 8
//     },
//     {
//         name: "Inner Right",
//         enter: 7,
//         in: 9
//     },
//     {
//         name: "Center",
//         enter: {
//             forward: 1,
//             backwards: 0
//         },
//         in: {
//             forward: 0,
//             backwards: 1
//         }
//     }
// ]

class BlockManager extends events.EventEmitter {
    constructor(sensors, locos, blocks) {
        super();
   //     this.z21 = z21;
        this.sensors = sensors;
        this.locos = locos;
        this.blocks = blocks;
        this.direction = locos[0].direction;
        sensors.on("change", (data) => {
            if (data.active === true) {
                for (let i = 0; i < this.blocks.length; i++) {
                    let current = this.blocks[i];
                    let newStatus;
                    if (current.status === "reserved" && current.ccw.enter === data.address) {
                        newStatus = "enter";
                    } else if (current.status === "enter" && current.ccw.in === data.address) {
                        newStatus = "in";
                    } 
                    if (newStatus) {
                        current.status = newStatus
                        this.emit("status", {
                            name: current.name,
                            status: newStatus
                        })
                    }
                    // let enter = current.enter[this.direction] || current.enter;
                    // let stop = current.in[this.direction] || current.in;
                    // if (data.address === current.enter) {
                    //     current.status = "entering";

                    // } else if (data.address === current.in) {
                    //     current.status = "in";
                    // } else {
                    //     current.status = undefined;
                    // }
                    // if (current.status !== undefined) {
                    //     this.emit("status", {
                    //         name: current.name,
                    //         status: current.status
                    //     })
                    // }
                }
            }
        })
    }
    setLocoPosition(loco, blockId, orientation) {
        this.blocks.find((val, index)=>{
            if (val.name === blockId) {
                val.status = "in";
                val.loco = loco;
                val.locoOrientation = orientation;
            }
        })
    }
    reserveBlock(blockId, loco) {
      this.blocks.find((val, index)=>{
            if (val.name === blockId) {
                val.status = "reserved";
                val.loco = loco;
            }
        })
    }

}

module.exports = BlockManager;