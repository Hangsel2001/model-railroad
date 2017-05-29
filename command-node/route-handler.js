"use strict";
const EventEmitter = require('events').EventEmitter;

class RouteHandler extends EventEmitter {
    constructor(z21, sensors, loco, config) {
        super();
        this.z21 = z21;
        this.sensors = sensors;
        this.loco = loco,
            this.config = config;

        this.sensorOrder = config.passing || [];
        this.sensorOrder.push(config.enter);
        this.sensorOrder.push(config.stop);
        this.sensorIndex = 0;
    }
    go() {
        this.loco.setDirection(this.config.direction);
        this.loco.setSpeed(70);
        this.sensors.on("change", (data) => {
            if (data.active) {
                if (data.address === this.sensorOrder[this.sensorIndex]) {
                    this.sensorIndex ++;
                    if (data.address === this.config.stop) {
                        this.loco.setSpeed(0);
                    } else if (data.address === this.config.enter) {
                        this.loco.setSpeed(30);
                    }
                } else {
                    this.emit("error", "Unexpected sensor address " + data.address);
                }
            };
        })
    }
}

module.exports = RouteHandler