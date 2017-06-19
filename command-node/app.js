'use strict';

const input = new(require("./user-input"))();
const cs = new(require("./z21"))();
const sensors = new(require("./sensors"))();
const loco = new(require("./loco"))(cs, 3);
const Route = require("./route");
const blocks = new(require("./block-manager"))(sensors, [loco], require("./spec/helpers/blocks").getBlocks(), cs);
const inventory = require("./inventory");
const planner = new(require("./travel-planner"))(loco, blocks, inventory.getRouteDefs());

cs.init();

cs.on("message", (message) => {
    console.log(message);
});

input.on("left", () => {
    cs.locoLeft();
    console.log("left");
});
input.on("right", () => {
    cs.locoRight();
    console.log("right");
});

input.on("space", () => {
    cs.locoStop();
})
input.on("up", () => {
    cs.turnoutStraight();
});
input.on("down", () => {
    cs.turnoutTurn();
});

let power = false;
input.on("return", () => {
    power = !power;
    if (power) {
        cs.powerOff();
    } else {
        cs.powerOn();
    }
})

sensors.on("change", (data) => {
    console.log(data);
})

let hasSet = false;
input.on("z", () => {
    if (!hasSet) {
        blocks.setLocoPosition(loco, "OuterRight", "cw");
        hasSet = true;
    }
    planner.addDestination("Middle");
    planner.currentRoute.go();
})
input.on("x", () => {
    if (!hasSet) {
        blocks.setLocoPosition(loco, "Middle", "cw");
        hasSet = true;
    }
    planner.addDestination("OuterRight");
    planner.currentRoute.go();
})


blocks.on("status", (status) => {
    console.log("----------------------------------");
    console.log(status);
    console.log("----------------------------------");
    if (status.status === "unexpected") {
        cs.powerOff();
        power = false;
    }
})