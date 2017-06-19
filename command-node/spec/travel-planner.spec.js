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
            direction: "ccw"
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
    xit("creates a two-section route",()=> {
          blockManager.setLocoPosition(loco, "OuterRight", "cw");
          planner.addDestination("OuterLeft");
          expect(planner.currentRoute.sections.length).toBe(2);
          expect(planner.currentRoute.section[1]).toEqual({
            loco: loco,
            start: "Middle",
            end: "OuterLeft",
            turnout: {
                "t0": "straight"
            },
            direction: "ccw"
        })
    })

})