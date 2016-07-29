var client = require('./RocrailClient.js');
var Serial = require('serialport');
var port = new Serial('COM4', {
    parser: Serial.parsers.readline('\n')
});
var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var loco;
var destinationMap = { "1": "OE", "2": "IE", "3": "Center", "4": "NW", "5": "SW" };

rl.on('line', function (input) {
    loco.goTo(input);
});

client.on("connected", function () {
    console.log("connected");
    var id1active = false;
    loco = client.getLoco("RC5");
    client.on("data", function (data) { 
        console.log(data);
    });

    port.on('data', function (data) {
        var type = data[0];
        var id = data[1];
        if (type === "S") {
            var state = data[2];
            if (state === "1") {
                client.activateSensor(id);
                
            } else {
                client.deactivateSensor(id);
            }
        } else if (type === "B") {
            loco.goTo(destinationMap[data[1]]);
        }

    });  
});

client.connect();

