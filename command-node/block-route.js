"use strict";
const EventEmitter = require('events').EventEmitter;

class Route extends EventEmitter {
    constructor(manager, def) {
        super();        
        this.CRUISE = 55;
        this.SLOW = 10;
        this.manager = manager;
        this.def = def;        
    };
    //     this.z21 = z21;
    //     this.sensors = sensors;
    //     this.loco = loco,
    //         this.config = config;

    //     this.sensorOrder = config.passing || [];
    //     this.sensorOrder.push(config.enter);
    //     this.sensorOrder.push(config.stop);
    //     this.sensorIndex = 0;
    //     this.callBack = (data) => {
    //         if (data.active) {
    //             if (data.address === this.sensorOrder[this.sensorIndex]) {
    //                 this.sensorIndex ++;
    //                 if (data.address === this.config.stop) {
    //                     this.loco.setSpeed(0);
    //                     this.emit("done");
    //                     this.removeAllListeners();
    //                     this.sensors.removeListener("change", this.callBack)
    //                 } else if (data.address === this.config.enter) {
    //                     this.loco.setSpeed(this.SLOW);
    //                     // console.log("SLOW from " + this.config.name);
    //                 }
    //             } else if (!(config.ignore && config.ignore.includes(data.address))) {
    //                 this.emit("warning", "Unexpected sensor address " + data.address);
    //             } 
    //         };
    //     }
    // }
    go() {
        this.manager.reserveBlock(this.def.end, this.def.loco);
        let start = this.manager.getBlock(this.def.start);
        let dir = "backwards";
        if (this.def.direction === start.locoOrientation) {
            dir = "forward";
        }
        this.def.loco.setDirection(dir);
        this.def.loco.setSpeed(this.CRUISE);
        
        this.manager.on("status", (data) => {
            if (data.name === this.def.end) {
                if (data.status === "enter") {
                    this.def.loco.setSpeed(this.SLOW);
                } else if (data.status === "in") {
                    this.def.loco.setSpeed(0);
                    this.emit("done");
                }
            }
        });

        };
 
    //      this.sensors.on("change", this.callBack )
    // }
    // abort() {
    //     this.loco.setSpeed(0);
    //     this.emit("aborted");
    //     this.sensors.removeListener("change", this.callBack)
    //     this.removeAllListeners();
    // }
}

module.exports = Route