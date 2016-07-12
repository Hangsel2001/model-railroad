var client = require('./rocrailclient.js');

client.on("connected", function () {
    //client.write('<?xml version="1.0" encoding="UTF-8"?><xmlh><xml size="154"/></xmlh><fb id="5" state="true" val="0" addr="0" bus="0" fbtype="0" identifier="" counter="2" carcount="0" countedcars="0" wheelcount="0" load="0" maxload="0"/>")');
    // client.write('<?xml version="1.0" encoding="UTF-8"?><xmlh><xml size="155"/></xmlh><fb id="5" state="false" val="0" addr="0" bus="0" fbtype="0" identifier="" counter="3" carcount="0" countedcars="0" wheelcount="0" load="0" maxload="0"/>")');
    //client.write('<?xml version="1.0" encoding="UTF-8"?><xmlh><xml size="476"/></xmlh><lc id="RC5" V="0" fn="true" dir="false" throttleid="rv8472" controlcode="" slavecode="" server="infw00ACDA24" addr="3" secaddr="0" placing="false" blockenterside="false" blockenterid="" mode="idle" modereason="nodest" resumeauto="true"manual="false" blockid="YttersvÃ¤ng" destblockid="" runtime="200" mtime="0"mint="0" active="true" waittime="0" scidx="-1" scheduleid="" tourid="" train="" trainlen="0" trainweight="0" V_realkmh="0" fifotop="false" image="" imagenr="0"/>')
    
    //client.send('<lc addr="3" V_raw="87" cmd="velocity" />');
    //client.send('<lc addr="3" V_raw="50"/>');
    
    function comm() {
        if (dir === "true") {
            dir = "false"
        } else {
            dir = "true"
        };
        
        
        client.send('<lc id="RC5" dir="' + dir + '" V="31"/>');
        setTimeout(comm, 10000);
    }
    

    var dir = "true";
    comm();

});

client.connect();

