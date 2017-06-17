'use strict';

const input = new(require("./user-input"))();
const cs = new(require("./z21"))();
const sensors = new(require("./sensors"))();
const loco = new(require("./loco"))(cs, 3);
const Route = require("./route");
const blocks = new(require("./block-manager"))(sensors, [loco], require("./spec/helpers/blocks").getBlocks(), cs);
const BlockRoute = new(require("./block-route"))(blocks, {
    loco: loco,
    start: "OuterRight",
    end: "Middle",
    turnout: {
        "0": "straight"
    },
    direction: "ccw"
});

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

function handleRoute(config) {
    if (route) {
        route.abort();
    }
    route = new Route(cs, sensors, loco, config);
    route.on("warning", () => {
        cs.powerOff();
    })
    route.on("done", () => {
        console.log("Done!");
        route = null;
    });
    route.go();
}

let route = null;
let hasSet= false;
input.on("z", () => {
    if (!hasSet) {
        blocks.setLocoPosition(loco, "OuterRight", "cw");
    }
    if (blocks.getBlock("OuterRight").loco === loco) {
        
        let br = new(require("./block-route"))(blocks, {
            loco: loco,
            start: "OuterRight",
            end: "Middle",
            turnout: {
                "t1": "straight"
            },
            direction: "ccw"
        });
        br.on("done", () => {
            console.log("OtoM Done!")
        });
        br.go();
    } else {
        console.log("Wrong starting block");
    }
})

input.on("1", () => {
    handleRoute(routes[0]);
})

input.on("2", () => {
    handleRoute(routes[1]);
})

input.on("3", () => {
    handleRoute(routes[2]);
})

input.on("4", () => {
    handleRoute(routes[3]);
})

let rotatePos = 0;

function rotateRoute() {
    if (wasAborted) {
        wasAborted = false;
        return;
    }
    if (rotatePos === routes.length) {
        rotatePos = 0;
    }
    route = new Route(cs, sensors, loco, routes[rotatePos]);
    route.on("warning", () => {
        cs.powerOff();
    })
    route.on("done", () => {
        console.log("Done!");
        setTimeout(rotateRoute, 1000);
    });
    rotatePos++;
    route.go();
};


input.on("a", () => {
    rotateRoute();
})

let wasAborted = false;

input.on("escape", () => {
    if (route) {
        route.abort();
        route = null;
        wasAborted = true;
    }
})

blocks.on("status", (status) => {
    console.log("----------------------------------");
    console.log(status);
    console.log("----------------------------------");
})