let Route = require("../block-route");
let BlockManager = require("../block-manager");
let Z21 = require("./helpers/mock-z21");
let blocks = require("./helpers/blocks");
let Loco = require("../loco");
let events = require("events");
describe("Block route handler", () => {
    var loco, route, blockManager, sensors, z21, setSpeed, setDirection, routeEmit;
    beforeEach(()=> {
                z21 = new Z21();        
        sensors = new events.EventEmitter();
        
        loco = new Loco(z21, 3);
        setSpeed = spyOn(loco, "setSpeed");
        setDirection = spyOn(loco, "setDirection");
        
        blockManager = new BlockManager(sensors,[loco],blocks.getBlocks());
        blockManager.setLocoPosition(loco, "OuterRight", "ccw");

        let def = {
            loco: loco,
            start: "OuterRight",
            end: "Middle",
            turnout: {"0": "straight"},
            direction: "ccw"
        }
        route= new Route(blockManager,def);
        routeEmit = spyOn(route, "emit");

    })
    it("reserves target route",() => {               
        let middle = blockManager.getBlock("Middle");
        route.go();   
        expect(middle.status).toBe("reserved");
    })

    it("marks as exiting", ()=> {      
        let or = blockManager.getBlock("OuterRight");
        expect(or.status).toBe("in");
        route.go();   
        expect(or.status).toBe("exiting");
    })

    it("receives incoming loco", ()=>{
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

    it("sets direction according to loco orientation", ()=> {
        route.go();
        expect(setDirection).toHaveBeenCalledWith("forward");
        blockManager.setLocoPosition(loco, "OuterRight", "cw")
    });
    it("sets backwards direction according to loco orientation", ()=> {
        blockManager.setLocoPosition(loco, "OuterRight", "cw");
        route.go();
        expect(setDirection).toHaveBeenCalledWith("backwards");
    });

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