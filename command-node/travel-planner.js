"use strict";
const EventEmitter = require('events').EventEmitter;
const BlockRoute = require('./block-route');

function clone(obj) {
    return obj ? JSON.parse(JSON.stringify(obj)) : obj;
}

function reverseRoute(route) {
    let end = route.end;
    route.end = route.start;
    route.start = end;
    route.direction = route.direction === "cw" ? "ccw" : "cw";
}

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
    getExplicitRoute(dest) {
        return clone(this.routeDefs.find((val) => {
            return val.start === this.currentBlock.name &&
                val.end === dest;
        }));
    }

    getReverseRoute(dest) {
        let route = clone(this.routeDefs.find((val) => {
            return val.end === this.currentBlock.name && val.start === dest
        }));
        if (route) {
            reverseRoute(route);
        }
        return route;
    }

    getAllRoutes(start, ignores) {
        let startsWithCurrent = clone(this.routeDefs.filter((val) => {
            return val.start === start;
        }));
        let endsWithCurrent = clone(this.routeDefs.filter((val) => {
            return val.end === start;
        }));
        endsWithCurrent.forEach((val) => {
            reverseRoute(val);
        })

        startsWithCurrent = startsWithCurrent.concat(endsWithCurrent);
        if (ignores) {
            startsWithCurrent = startsWithCurrent.filter((val) => {
                return !ignores.some((ignore) => {
                    return ignore === val.end;
                })
            });
        }
        return startsWithCurrent;
    };

    getActualRoute(start, end, ignores) {
        return clone(this.getAllRoutes(start, ignores).find((val) => {
            return val.end === end;
        }));
    }

    getComposedRoute(start, end, ignores, sections) {
        ignores = ignores || [];
        ignores = ignores.slice();
        sections = sections || [];
        sections = clone(sections);

        let final = this.getActualRoute(start, end, ignores);
        if (final) {
            sections.push(final);
            return sections;
        }

        let allRoutes = this.getAllRoutes(start, ignores);
        if (allRoutes.length === 0) {
            throw "No matching route";
        }

        ignores.push(start);
        for (let route of allRoutes) {
            try {
                sections.push(route);
                return this.getComposedRoute(route.end, end, ignores, sections);
            } catch (ex) {

            }
        }
    }


addDestination(dest) {
    this.nextDestination = this.blockManager.getBlock(dest);
    let route = this.getExplicitRoute(dest) || this.getReverseRoute(dest) || this.getComposedRoute(this.currentBlock.name, dest);

    if (!route) {
        throw "No matching route";
    }
    if (Array.isArray(route)) {
        route = {
            sections: route
        }
    }
    route.loco = this.loco;
    this.currentRoute = new BlockRoute(this.blockManager, route);
}
}

module.exports = TravelPlanner;