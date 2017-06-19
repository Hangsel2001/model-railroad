"use strict";
const EventEmitter = require('events').EventEmitter;
const BlockRoute = require('./block-route');

class TravelPlanner extends EventEmitter {
    constructor(loco, blockManager, routeDefs) {
        super();
        this.loco = loco;
        this.blockManager = blockManager;
        this.queue = [];

        this.blocks = this.blockManager.getBlocks();
        this.routeDefs = routeDefs;
    }
    get currentBlock() {
        return this.blocks.find((val) => {
            return val.loco === this.loco && val.status === "in";
        })
    }
    addDestination(dest) {
        this.nextDestination = this.blockManager.getBlock(dest);
        let routeDef = this.routeDefs.find((val) => {
            return val.start === this.currentBlock.name &&
                val.end === dest;
        });
        if (!routeDef) {
            routeDef = this.routeDefs.find((val) => {
                return val.end === this.currentBlock.name && val.start === dest
            });
            if (!routeDef) {
                throw "No matching route";
            }
            let end = routeDef.end;
            routeDef.end = routeDef.start;
            routeDef.start=  end;
            routeDef.direction = routeDef.direction === "cw" ? "ccw" : "cw";            
        };
        let def = JSON.parse(JSON.stringify(routeDef));
        def.loco = this.loco;
        this.currentRoute = new BlockRoute(this.blockManager, def);
    }
}

module.exports = TravelPlanner;