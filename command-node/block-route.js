"use strict";
const EventEmitter = require('events').EventEmitter;

class Route extends EventEmitter {
    constructor(manager, def) {
        super();
        this.CRUISE = 57;
        this.STEADY = 40;
        this.SLOW = 15;
        this.MIN = 10;
        this.manager = manager;
        this.def = def;
        this.sections = def.sections || [def];
        this.sectionIndex = 0;
        this.currentSection = this.sections[this.sectionIndex];
    };

    setTurnouts(section) {
        for (let prop in section.turnout) {
            let current = section.turnout[prop];
            this.manager.setTurnout(prop, current);            
        }
    }

    reserveAndStart() {
        try {
            this.manager.reserveBlock(this.currentSection.end, this.def.loco, this.currentSection.direction);
        } catch (ex) {
            console.log(ex);
            this.def.loco.setSpeed(0);
        }
        // let start = this.manager.getBlock(this.currentSection.start);
        let dir = "backwards";
        if (this.currentSection.direction === this.def.loco.orientation) {
            dir = "forward";
        }
        this.setTurnouts(this.currentSection);
        this.def.loco.setDirection(dir);
        let speed = this.currentSection.slow ? this.STEADY : this.CRUISE;
        this.def.loco.setSpeed(speed);


    }

    go() {
        this.reserveAndStart();
        this.statusCallback = (data) => {
            if (data.name === this.currentSection.end) {
                if (data.status === "enter") {
                    let isLast = this.sectionIndex === this.sections.length - 1;

                    if (isLast || this.currentSection.direction !== this.sections[this.sectionIndex + 1].direction) {
                        let speed = this.currentSection.slow? this.MIN : this.SLOW;
                        this.def.loco.setSpeed(speed);
                    }
                    if (!isLast) {
                        this.setTurnouts(this.sections[this.sectionIndex + 1]);
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
        this.manager.removeListener("status", this.statusCallback);
    }

}

module.exports = Route