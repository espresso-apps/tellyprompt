// Code taken from the Logitech Smooth Scrolling chrome extension

const WebSocket = require("ws");

function lssClient() {
    var self = this;
    this._ws = null;
    this._initialized = false;

    for(var i=0;i<5;++i) {
        var host = "ws://127.0.0.1:";
        var hostPortNum = 59243;
        hostPortNum = hostPortNum + i;
        host = host + hostPortNum;  
        //console.log("Port number:" + host);	
        
        try
        {
            //console.log("initWebSockets");
            socket = new WebSocket(host);
            socket.on("open", function() {
                //console.log("connected to target");
                self._ws = socket;
                //chrome.tabs.getSelected(null, function(tab) {
                //    chrome.tabs.sendRequest(tab.id, {id: "refreshContent"});
                //});
            });
            //console.log("web socket initialized");
            this._initialized = true;
            break;
            /*
            socket.on("error", function(msg) {
                console.log("socket.onerror");
            });
            socket.on("message", function(msg) {
                console.log("socket.onmessage");
            });
            socket.on("close", function(msg) {
                console.log("socket.onclose");
            });
            */
        }
        catch(aException)
        {
            console.error(initWebSockets, aException);
        }
    }
}

lssClient.prototype.setEnabled = function(enabled) {
    if(this._initialized) {
        var msg = JSON.stringify({hiRes: enabled, reason: (enabled?"enable requested":"disable requested")});
        //console.log("lss: sending: " + msg);
        this._ws.send(msg);
    }
};


module.exports = lssClient;