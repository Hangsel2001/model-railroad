"use strict";
let events = require("events");

class BlockManager extends events.EventEmitter {
    constructor(sensors, locos, blocks, z21) {
        super();
        // this.sensors = sensors;
        this.locos = locos;
        this.blocks = blocks;
        this.z21 = z21;
        // this.direction = locos[0].direction;
        sensors.on("change", (data) => {
            if (data.active === true) {
                for (let i = 0; i < this.blocks.length; i++) {
                    let current = this.blocks[i];
                    if (current.type === undefined) {
                        let newStatus, enter, sensorIn;
                        if (current.entryDirection === "ccw") {
                            enter = current.ccw.enter ;
                            sensorIn = current.ccw.in;
                        } else {
                            enter = current.ccw.in;
                            sensorIn = current.ccw.enter;
                        }
                        if (current.status === "reserved" && enter === data.address) {
                            newStatus = "enter";
                        } else if (current.status === "enter" && sensorIn === data.address) {
                            newStatus = "in";
                            this.releasePrevious(current.loco);
                        } else if ((data.address === sensorIn || data.address === enter) && current.status !== "exiting") {
                            newStatus = "unexpected";
                        }
                        if (newStatus) {
                            current.status = newStatus
                            this.emit("status", {
                                name: current.name,
                                status: newStatus
                            })
                        }
                    }
                }
            }
        })
    }
    setLocoPosition(loco, blockId, orientation) {
        this.blocks.find((val, index) => {
            if (val.name === blockId) {
                val.status = "in";
                val.loco = loco;
                loco.orientation = orientation;
            } else if (val.loco === loco) {
                val.status = undefined;
                val.loco = undefined;
                val.orientation = undefined;
            }
        })
    }
    reserveBlock(blockId, loco, direction) {
        console.log("** Reserving " + blockId + " **")
        this.blocks.find((val, index) => {
            if (val.name === blockId) {
                if (val.status) {
                    throw {
                        error: "Can't reserve",
                        message: val.status
                    };
                }
                val.status = "reserved";
                val.loco = loco;
                val.entryDirection = direction || "ccw";
            }
        })
        this.blocks.find((val, index) => {
            if (val.loco === loco && val.name !== blockId) {
                val.status = "exiting";
            }
        });


    }
    releasePrevious(loco) {
        this.blocks.find((val) => {
            if (val.loco === loco && val.status === "exiting") {
                val.status = undefined;
                val.loco = undefined;
            }
        })
    }
    getBlock(id) {
        return this.blocks.find((val) => {
            return val.name === id;
        })

    }
    getBlocks() {
        return this.blocks;
    }
    setTurnout(id, pos) {
        console.log(id + ": " + pos);
        var to = this.getBlock(id);
        this.z21.send({
            type: "turnout",
            address: to.address,
            position: pos
        });
    }

}

module.exports = BlockManager;