let Route = require("../block-route");
let BlockManager = require("../block-manager");
let Z21 = require("./helpers/mock-z21");
let blocks = require("./helpers/blocks");
let Loco = require("../loco");
let events = require("events");
describe("Block route handler", () => {
    var loco, route, blockManager, sensors, z21, setSpeed, setDirection, routeEmit, def, outerDef;
    beforeEach(() => {
        z21 = new Z21();
        sensors = new events.EventEmitter();

        loco = new Loco(z21, 3);
        setSpeed = spyOn(loco, "setSpeed");
        setDirection = spyOn(loco, "setDirection");

        blockManager = new BlockManager(sensors, [loco], blocks.getBlocks(), z21);
        blockManager.setLocoPosition(loco, "OuterRight", "ccw");

        def = {
            loco: loco,
            start: "OuterRight",
            end: "Middle",
            turnout: {
                "t1": "straight"
            },
            direction: "ccw"
        }

        outerDef = {
            loco: loco,
            sections: [{

                start: "OuterRight",
                end: "Middle",
                turnout: {
                    "0": "straight"
                },
                direction: "ccw"
            }, {

                start: "Middle",
                end: "OuterLeft",
                turnout: {
                    "1": "straight"
                },
                direction: "ccw"
            }]
        };

        route = new Route(blockManager, def);
        routeEmit = spyOn(route, "emit");

    })
    it("reserves target route", () => {
        let middle = blockManager.getBlock("Middle");
        route.go();
        expect(middle.status).toBe("reserved");
    })

    it("marks as exiting", () => {
        let or = blockManager.getBlock("OuterRight");
        expect(or.status).toBe("in");
        route.go();
        expect(or.status).toBe("exiting");
    })

    it("receives incoming loco", () => {
        let middle = blockManager.getBlock("Middle");
        route.go();

        toggleSensor(0);
        expect(middle.status).toBe("enter");
        expect(loco.setSpeed).toHaveBeenCalledWith(route.SLOW);

        toggleSensor(1);
        expect(middle.status).toBe("in");
        expect(loco.setSpeed).toHaveBeenCalledWith(0);

        expect(route.emit).toHaveBeenCalledWith("done");
    })

    it("sets direction according to loco orientation", () => {
        route.go();
        expect(setDirection).toHaveBeenCalledWith("forward");
    });

    it("sets backwards direction according to loco orientation", () => {
        blockManager.setLocoPosition(loco, "OuterRight", "cw");
        route.go();
        expect(setDirection).toHaveBeenCalledWith("backwards");
    });

    it("handles multiblock route", () => {

        route = new Route(blockManager, outerDef);
        let or = blockManager.getBlock("OuterRight");
        let mid = blockManager.getBlock("Middle");
        let ol = blockManager.getBlock("OuterLeft");
        route.go();
        toggleSensor(0);
        expect(mid.status).toBe("enter");
        toggleSensor(1);
        toggleSensor(3);
        expect(mid.status).toBe("exiting");
        expect(ol.status).toBe("enter");

    })

    it("keeps full speed when passing", () => {
        route = new Route(blockManager, outerDef);
        route.go();
        toggleSensor(0);
        expect(setSpeed).not.toHaveBeenCalledWith(route.SLOW);
    })

    it("sets route turnouts", () => {
        var setTurnout = spyOn(blockManager, "setTurnout");
        route = new Route(blockManager, def);
        route.go();
        expect(setTurnout).toHaveBeenCalledWith("t1", "straight");
    })

    describe("reverse direction", () => {
        beforeEach(() => {
            def = {
                loco: loco,
                start: "Middle",
                end: "OuterRight",
                turnout: {
                    "t1": "straight"
                },
                direction: "cw"
            }
            route = new Route(blockManager, def);
            blockManager.setLocoPosition(loco, "Middle", "cw");
            route.go();
        })
        it("sends loco other direction", () => {            
            expect(setDirection).toHaveBeenCalledWith("forward");
        })
        it("reverses sensor points", () => {
            toggleSensor(6);
            let right = blockManager.getBlock("OuterRight");
            let middle = blockManager.getBlock("Middle");
            expect(right.status).toBe("enter");
            expect(middle.status).toBe("exiting");            
        })
    })

    function toggleSensor(addr) {
        sensors.emit("change", {
            address: addr,
            active: true
        });
        sensors.emit("change", {
            address: addr,
            active: false
        });
    }
})