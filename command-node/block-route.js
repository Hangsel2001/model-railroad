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
   
    go() {
        this.manager.reserveBlock(this.def.end, this.def.loco);
        let start = this.manager.getBlock(this.def.start);
        let dir = "backwards";
        if (this.def.direction === start.locoOrientation) {
            dir = "forward";
        }
        this.def.loco.setDirection(dir);
        this.def.loco.setSpeed(this.CRUISE);

        this.statusCallback = (data) => {
            if (data.name === this.def.end) {
                if (data.status === "enter") {
                    this.def.loco.setSpeed(this.SLOW);
                } else if (data.status === "in") {
                    this.def.loco.setSpeed(0);
                    this.emit("done");
                    this.dispose();
                }
            }
        }
        
        this.manager.on("status", this.statusCallback);

    };

    cancel() {
        this.def.loco.setSpeed(0);
        this.dispose();
    }

    dispose() {
        this.manager.removeListener("change", this.statusCallback);
    }
 
}

module.exports = Route