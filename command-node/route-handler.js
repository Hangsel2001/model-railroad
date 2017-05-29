"use strict";
const EventEmitter = require('events').EventEmitter;

class RouteHandler extends EventEmitter {
    constructor(z21, sensors, loco, config) {
        super();
        this.CRUISE = 60;
        this.SLOW = 20;
        this.z21 = z21;
        this.sensors = sensors;
        this.loco = loco,
            this.config = config;

        this.sensorOrder = config.passing || [];
        this.sensorOrder.push(config.enter);
        this.sensorOrder.push(config.stop);
        this.sensorIndex = 0;
        this.callBack = (data) => {
            if (data.active) {
                if (data.address === this.sensorOrder[this.sensorIndex]) {
                    this.sensorIndex ++;
                    if (data.address === this.config.stop) {
                        this.loco.setSpeed(0);
                        this.emit("done");
                        this.removeAllListeners();
                    } else if (data.address === this.config.enter) {
                        this.loco.setSpeed(this.SLOW);
                    }
                } else {
                    this.emit("warning", "Unexpected sensor address " + data.address);
                }
            };
        }
    }
    go() {
        this.loco.setDirection(this.config.direction);
        this.loco.setSpeed(this.CRUISE);
 
 
         this.sensors.on("change", this.callBack )
    }
    abort() {
        this.loco.setSpeed(0);
        this.emit("aborted");
        this.sensors.removeListener("change", this.callBack)
        this.removeAllListeners();
    }
}

module.exports = RouteHandler