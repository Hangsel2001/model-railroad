function getRouteDefs() {
    return [{
            start: "OuterRight",
            end: "Middle",
            turnout: {
                "t1": "straight"
            },
            direction: "ccw"
        }];
}

module.exports.getRouteDefs = getRouteDefs;