'use strict';

const input = new(require("./user-input"))();
const cs = new(require("./z21"))();
const sensors = new(require("./sensors"))();
const loco = new(require("./loco"))(cs, 3);
const Route = require("./route");
const blocks = new(require("./block-manager"))(cs, sensors, loco);

const routes = [{
        name: "Route 1",
        passing: [6, 0, 1],
        enter: 3,
        stop: 4,
        ignore: [8],
        direction: "backwards",
        turnouts: {
            "0": "straight",
            "1": "straight"
        }
    }, {
        name: "Route 2",
        passing: [3, 1, 0],
        enter: 6,
        stop: 8,
        ignore: [4],
        direction: "forward",
        turnouts: {
            "0": "straight",
            "1": "straight"
        }
    }, {
        name: "Route 3",
        passing: [6, 0, 1],
        enter: 5,
        stop: 2,
        ignore: [8],
        direction: "backwards",
        turnouts: {
            "0": "turn",
            "1": "straight"
        }
    }, {
        name: "Route 4",
        passing: [5, 1, 0],
        enter: 6,
        stop: 8,
        ignore: [2],
        direction: "forward",
        turnouts: {
            "0": "turn",
            "1": "straight"
        }
    }


]
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

let wasAborted  = false;

input.on("escape", ()=>{
    if (route) {
        route.abort();
        route = null;
        wasAborted = true;
    }
})

blocks.on("status" , (status)=>{
    console.log("----------------------------------");
    console.log(status);
    console.log("----------------------------------");
})