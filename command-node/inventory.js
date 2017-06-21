function getRouteDefs() {
    return [{
            start: "OuterRight",
            end: "Middle",
            turnout: {
                "t1": "straight"
            },
            direction: "ccw"
        },{
            start:"Middle",
            end: "OuterLeft",
            turnout: {
                "t0":"straight"
            },
            direction: "ccw"
        },{
            start:"Middle",
            end:"InnerRight",
            turnout: {
                "t1":"turn"
            },
            direction: "cw"
        }, {
            start:"InnerLeft",
            end :"Middle",
            turnout: {
                "t0":"turn"
            },
            direction : "cw"
        }];
}

module.exports.getRouteDefs = getRouteDefs;