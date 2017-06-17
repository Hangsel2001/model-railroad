    function blocks() { 
        return [{
            name: "OuterRight",
            ccw: {
                enter: 8,
                in: 6
            },
            connections: {
                ccw: {
                    name: "t1",
                    connector: "straight",
                }
            }
        }, {
            name: "Middle",
            ccw: {
                enter: 0,
                in: 1
            }
        }, {
            name: "OuterLeft",
            ccw: {
                enter: 3,
                in: 4
            }
        }, {
            name: "InnerRight",
            ccw: {
                enter: 9,
                in: 7
            }
        },
        {
            name: "InnerLeft",
            ccw: {
                enter: 5,
                in: 2
            }

        }, {
            name: "t0",
            address: 0,
            type: "turnout",
            connections: {
                "straight" : "OuterRight",
                "turn": "InnerRight",
                "cw" : "Middle"
            }
        },{
            name: "t1",
            address: 1,
            type: "turnout",
            connections: {
                "straight" : "OuterLeft",
                "turn": "InneLeft",
                "ccw" : "Middle"
            }
        }]
    }
    
    module.exports = {getBlocks:blocks};