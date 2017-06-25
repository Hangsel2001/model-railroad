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
    // console.log(message);
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
input.on("q", () => {
    cs.turnoutStraight(0);
});
input.on("w", () => {
    cs.turnoutTurn(0);
});
input.on("e", () => {
    cs.turnoutStraight(1);
});
input.on("r", () => {
    cs.turnoutTurn(1);
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
    console.log("-- Sensor" + data.address + ": " + data.active + " --");
})

let hasSet = false;

function setPosOrDest(name) {
    if (!hasSet) {
        blocks.setLocoPosition(loco, name, "cw");
        hasSet = true;
        notify("Current Position is set to " + name);
    } else {
        try {
            planner.addDestination(name);
            notify("New destination added: " + name);
        } catch (ex) {
            console.log(ex);
        }
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
input.on("v", () => {
    setPosOrDest("OuterRight");
});
input.on("c", () => {
    setPosOrDest("InnerRight");
});
input.on("x", () => {
    planner.clearDestinations();
    stop = true;
});

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}
let stop = true;

function setRandom() {
    let blocks = ["OuterLeft", "OuterRight", "Middle", "InnerLeft", "InnerRight"];    
    let notSet = true;
    do {
        try {
            let next = blocks[getRandomIntInclusive(0,4)];
            planner.addDestination(next);
             notify("New destination added: " + next);
            notSet = false;
        } catch (ex) {
        }
    } while (notSet)
}

planner.on("destination", ()=>{
    if (!stop) {
        setRandom();
    }
})

input.on("d", ()=>{
    stop = false;
    setRandom();
})

input.on("r", ()=>{
    planner.clearDestinations();
    hasSet=  false;
    cs.locoStop();
    cs.powerOn();
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