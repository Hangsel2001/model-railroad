let Route = require("../block-route");
let BlockManager = require("../block-manager");
let Z21 = require("./helpers/mock-z21");
let blocks = require("./helpers/blocks");
let Loco = require("../loco");
let events = require("events");
describe("Block route handler", () => {
    var loco, route, blockManager, sensors, z21;
    it("reserves target route",() => {
        
        z21 = new Z21();        
        sensors = new events.EventEmitter();
        
        loco = new Loco(z21, 3);
        
        blockManager = new BlockManager(sensors,[loco],blocks.getBlocks());
        let def = {
            loco: loco,
            startBlock: blockManager.getBlock("OuterRight"),
            endBlock: blockManager.getBlock("Middle"),
            turnout: {"0": "straight"}
        }
        route= new Route(blockManager,def);
        route.go();
        let actual = blockManager.getBlock("Middle");
        expect(actual.status).toBe("exiting");
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