let TravelPlanner = require("../travel-planner");
let Loco = require("../loco");
let BlockManager = require("../block-manager");
let blocks = require("./helpers/blocks");
let events = require("events");
let Z21 = require("./helpers/mock-z21");
let inventory = require("../inventory");

describe("travel planner", () => {
    let blockManager, loco, sensors, planner;
    beforeEach(() => {
        sensors = new events.EventEmitter();
        let z21 = new Z21();
        loco = new Loco(z21, 3, "RC5");
        blockManager = new BlockManager(sensors, [loco], blocks.getBlocks(), z21);
        planner = new TravelPlanner(loco, blockManager, inventory.getRouteDefs());
    });
    it("determines current block", () => {
        blockManager.setLocoPosition(loco, "OuterRight", "cw");
        expect(planner.currentBlock.name).toBe("OuterRight");
    });
    it("sets the selected destination", () => {
        blockManager.setLocoPosition(loco, "OuterRight", "cw");
        planner.addDestination("Middle");
        expect(planner.nextDestination).toBe(blockManager.getBlock("Middle"));
    })
    it("creates a route to adjacent block", () => {
        blockManager.setLocoPosition(loco, "OuterRight", "cw");
        planner.addDestination("Middle");
        expect(planner.currentRoute.currentSection).toEqual({
            loco: loco,
            start: "OuterRight",
            end: "Middle",
            turnout: {
                "t1": "straight"
            },
            direction: "ccw",
            slow: true
        });
    });
    it("determins reverse routes if not explicit", () => {
        blockManager.setLocoPosition(loco, "Middle", "cw");
        planner.addDestination("OuterRight");
        expect(planner.currentRoute.currentSection).toEqual({
            loco: loco,
            start: "Middle",
            end: "OuterRight",
            turnout: {
                "t1": "straight"
            },
            direction: "cw"
        });
    });
    it("creates a two-section route", () => {
        blockManager.setLocoPosition(loco, "OuterRight", "cw");
        planner.addDestination("OuterLeft");
        expect(planner.currentRoute.sections.length).toBe(2);
        expect(planner.currentRoute.sections[1]).toEqual({
            start: "Middle",
            end: "OuterLeft",
            turnout: {
                "t0": "straight"
            },
            direction: "ccw"
        })
    })
    it("can reverse direction in multisection", () => {
        blockManager.setLocoPosition(loco, "OuterRight", "cw");
        planner.addDestination("InnerRight");
        expect(planner.currentRoute.sections[1]).toEqual({
            start: "Middle",
            end: "InnerRight",
            turnout: {
                "t1": "turn"
            },
            direction: "cw"
        })
    })
    it("sets slow to defined Middle", () => {
        blockManager.setLocoPosition(loco, "OuterRight", "cw");
        planner.addDestination("Middle");
        expect(planner.currentRoute.sections[planner.currentRoute.sections.length -1].slow).toBeTruthy();
    });

    describe("destination queue", () => {
        beforeEach(() => {
            blockManager.setLocoPosition(loco, "OuterRight", "cw");
            planner.addDestination("Middle");
            planner.addDestination("InnerRight");
        })
        it("can queue destinations", () => {
            expect(planner.nextDestination).toBe(blockManager.getBlock("Middle"));
        })


        it("moves to next destination when done", (done) => {
            blockManager.setLocoPosition(loco, "Middle", "cw");
            blockManager.emit("status", {
                name: "Middle",
                status: "in"
            });
            planner.on("route", ()=> {
                expect(planner.nextDestination).toBe(blockManager.getBlock("InnerRight"));
                done();
            })            
        })

        it("cancels upcoming destinations", () => {
            planner.clearDestinations();
            expect(planner.nextDestination.name).toBe("Middle");
            expect(planner.destinationQueue.length).toBe(0);
        })

        it("can't add same destination twice", () => {
                planner = new TravelPlanner(loco, blockManager, inventory.getRouteDefs());
                    blockManager.setLocoPosition(loco, "OuterRight", "cw");
            planner.addDestination("Middle");
            expect(()=> {
                planner.addDestination("Middle");
            }).toThrow()
            // expect(() => {
            //     planner.addDestination("InnerRight")
            // }).toThrow();
        })
    })


    describe("bugs", () => {
        it("can handle OuterLeft to InnerLeft", () => {
            blockManager.setLocoPosition(loco, "OuterLeft", "cw");
            planner.addDestination("InnerLeft");
        })

        it("can handle OuterLeft in special case", () => {
            blockManager.setLocoPosition(loco, "InnerLeft", "cw");
            planner = new TravelPlanner(loco, blockManager, inventory.getRouteDefs());
            spyOn(planner, "nextAsync").and.callFake(()=> {
                planner.nextDestinationActive();
            });
            planner.addDestination("OuterLeft");
            planner.addDestination("OuterRight");
            planner.addDestination("InnerRight");
            planner.addDestination("OuterLeft");
            planner.addDestination("OuterRight");
            planner.addDestination("InnerLeft");
            toggleSensor([2, 5, 1, 0, 0, 1, 3, 4, 4, 3, 1, 0, 6, 8, 8, 6, 0, 1, 1, 0, 7, 9, 7, 0, 1, 3, 4]);
        })

        it("can handle InnerLeft to OuterLeft via Middle", ()=> {
            blockManager.setLocoPosition(loco, "InnerLeft", "cw");
            planner = new TravelPlanner(loco, blockManager, inventory.getRouteDefs());
            planner.addDestination("Middle");
            toggleSensor([2,5,1]);
            planner.addDestination("OuterLeft");
            toggleSensor([0]);
        })
        
    })

    function toggleSensor(addr) {
        if (addr.length) {
            for (let a of addr) {
                sensors.emit("change", {
                    address: a,
                    active: true
                });
                sensors.emit("change", {
                    address: a,
                    active: false
                });
            }
        } else {
            sensors.emit("change", {
                address: addr,
                active: true
            });
            sensors.emit("change", {
                address: addr,
                active: false
            });
        }
        // jasmine.clock.tick(10);
    }
})