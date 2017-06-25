    function blocks() { 
        return [{
            name: "OuterRight",
            ccw: {
                enter: 8,
                in: 6
            }
        }, {
            name: "Middle",
            ccw: {
                enter: 0,
                in: 1
            },
            short: true
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
            type: "turnout"
        },{
            name: "t1",
            address: 1,
            type: "turnout"
        }]
    }
    
    module.exports = {getBlocks:blocks};