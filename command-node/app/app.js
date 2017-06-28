(function () {
    var socket = io();
    var state = {};
    socket.on('block', function (data) {
        state[data.name]  = data;
        $('#data').html("");
        for (prop in state) {
        $("#data").append("<h1>" + prop + "</h1><pre>" +  JSON.stringify(state[prop]) + "</pre>");
        }        
    });
})();