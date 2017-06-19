let Z21 = require("./helpers/mock-z21");
let Coordinator = require("../coordinator");
let Loco = require("../loco");
let Route = require("../route");
let events = require("events");

describe("Coordinator", ()=> {
    let coordinator,z21, setSpeed, loco, route, sensors;
    beforeEach(()=>{
        z21 = new Z21();
        coordinator = new Coordinator(z21);
        loco = new Loco(z21, 3, "RC5");
        sensors = new events.EventEmitter();
        route = new Route(z21, sensors, loco, {
            name: "Route 1",
            passing: [1],
            enter: 2,
            stop: 3,
            direction: "forward",
            turnouts: {
                "1": "straight",
                "0": "turn"
            }
        });
        setSpeed =  spyOn(loco, "setSpeed");
        coordinator.loco = loco;
        coordinator.route = route;


    });
    // it("dispatches a loco", ()=>{
    //     coordinator.dispatch({
    //         loco: "RC5",
    //         route: "OuterToOuter"
    //     });
    //     expect(setSpeed).toHaveBeenCalledWith(route.CRUISE)
    // })
})