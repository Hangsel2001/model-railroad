"use strict";
const EventEmitter = require('events').EventEmitter;

class Route extends EventEmitter {
    constructor(manager, def) {
        super();
        this.CRUISE = 55;
        this.SLOW = 10;
        this.manager = manager;
        this.def = def;
        this.sections = def.sections || [def];
        this.sectionIndex = 0;
        this.currentSection = this.sections[this.sectionIndex];
    };

    reserveAndStart() {
        this.manager.reserveBlock(this.currentSection.end, this.def.loco, this.currentSection.direction);
        let start = this.manager.getBlock(this.currentSection.start);
        let dir = "backwards";
        if (this.currentSection.direction === this.def.loco.orientation) {
            dir = "forward";
        }
        this.def.loco.setDirection(dir);
        this.def.loco.setSpeed(this.CRUISE);
        for (let prop in this.currentSection.turnout) {
            let current = this.currentSection.turnout[prop];
            this.manager.setTurnout(prop, current);
        }
        
    }

    go() {
        this.reserveAndStart();
        this.statusCallback = (data) => {
            if (data.name === this.currentSection.end) {
                if (data.status === "enter") {
                    let isLast = this.sectionIndex === this.sections.length - 1;

                    if (isLast || this.currentSection.direction !== this.sections[this.sectionIndex + 1].direction) {
                        this.def.loco.setSpeed(this.SLOW);
                    }                    
                } else if (data.status === "in") {
                    if (this.sectionIndex < this.sections.length - 1) {
                        this.sectionIndex++;
                        this.currentSection = this.sections[this.sectionIndex];
                        this.reserveAndStart();
                    } else {
                        this.def.loco.setSpeed(0);
                        this.emit("done");
                        this.dispose();
                    }
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