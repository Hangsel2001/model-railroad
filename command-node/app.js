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
    console.log("Sensor:");
    console.log(data);
})

let hasSet = false;
function setPosOrDest(name) {
    if (!hasSet) {
        blocks.setLocoPosition(loco, name, "cw");
        hasSet = true;
        notify("Current Position is set to " + name);
    } else {
        planner.addDestination(name);
        planner.currentRoute.go();
        notify("New destination is set to " + name);
    }
}

input.on("z", () => {
    setPosOrDest("InnerLeft");
});
input.on("a", () => {
    setPosOrDest("OuterLeft");
});
input.on("s", () => {
    setPosOrDest("Middle");
});
input.on("d", () => {
    setPosOrDest("OuterRight");
});
input.on("c", () => {
    setPosOrDest("InnerRight");
});



blocks.on("status", (status) => {
    notify(status);
    if (status.status === "unexpected") {
        cs.powerOff();
        power = false;
    }
})

function notify(message) {
    console.log("----------------------------------");
    console.log(message);
    console.log("----------------------------------");
}