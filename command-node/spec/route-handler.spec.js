let Route = require("../route-handler");
let Z21 = require("./helpers/mock-z21");
// let Sensors = require("../sensors");
let Loco = require("../loco");
let events = require("events");
describe("Route handler", () => {
    var route, z21, sensors, loco, setSpeed, emit;
    beforeEach(() => {
        z21 = new Z21();
        sensors = new events.EventEmitter();

        loco = new Loco(z21, 3);
        z21.emit("message", {
            type: "loco",
            address: 3,
            direction: "forward",
            speed: 0,
            speedSteps: 128,
            functions: {
                "lights": true,
            }
        });
        setSpeed = spyOn(loco, "setSpeed");//.and.callThrough();
        route = new Route(z21, sensors, loco, {
            name: "Route 1",
            passing: [1],
            enter: 2,
            stop: 3,
            direction: "forward",
            turnouts: [{
                "1": "straight"
            }]
        });
        emit = spyOn(route, "emit");//.and.callThrough();
    })
    it("sets starts and stops", () => {
        expect(loco.speed).toBe(0);
        route.go();
        expect(setSpeed).toHaveBeenCalledWith(route.CRUISE);
    })
    it("emits error when unexpected sensor", () => {
        route.go();
        sensors.emit("change",{
            address: 5,
            active: true
        });
        sensors.emit("change",{
            address: 5,
            active: false
        });
        expect(emit).toHaveBeenCalled();
        expect(emit.calls.mostRecent().args[0]).toBe("warning");
    })
    it("checks for passing sensors", ()=>{
        route.go();
        toggleSensor(1);
        expect(emit).not.toHaveBeenCalled();
        toggleSensor(2);
        expect(emit).not.toHaveBeenCalled();
        toggleSensor(3);
        expect(setSpeed).toHaveBeenCalledWith(0);
    })
    it("slows on enter",()=>{
        route.go();
        toggleSensor(1);
        toggleSensor(2);
        expect(setSpeed.calls.mostRecent().args[0]).toEqual(route.SLOW);
    })

    it("stops worrying on abort", ()=> {
        route.go();
        route.abort();
        toggleSensor(9);
         expect(emit.calls.mostRecent().args[0]).not.toBe("warning");
    })

    function toggleSensor(addr) {
        sensors.emit("change",{address: addr, active : true});
        sensors.emit("change",{address: addr, active : false});
    }
})