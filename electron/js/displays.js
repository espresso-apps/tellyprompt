/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Tim Jenkins. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

var systemDisplays = [];

var getSystemDisplays = function() {
    var displays = electron.screen.getAllDisplays();

    console.log(displays);
    var screens = [];
    for(var i = 0; i < displays.length; i++) {
        var display = displays[i];
        
        display.name = "Display " + (i + 1);
        display.isPrimary = (display.bounds.x === 0 && display.bounds.y === 0);
        
        screens.push(display);
    }
    systemDisplays = screens;
};
getSystemDisplays();

var findDisplay = function(id) {
    for(var i = 0; i < systemDisplays.length; i++) {
        if(systemDisplays[i].id == id) {
            return systemDisplays[i];
        }
    }
    return null;
};

var onDisplayAdded = function(event, newDisplay) {
    console.log("display added. reloading...");
    getSystemDisplays();
}

var onDisplayRemoved = function(event, oldDisplay) {
    console.log("display removed. reloading...");
    getSystemDisplays();
}

var onDisplayMetricsChanged = function(event, display, changedMetrics) {
    console.log("display metrics changed. reloading...");
    getSystemDisplays();
}

electron.screen.on('display-added', onDisplayAdded);
electron.screen.on('display-removed', onDisplayRemoved);
electron.screen.on('display-metrics-changed', onDisplayMetricsChanged);

window.onbeforeunload = () => {
    electron.screen.removeListener('display-added', onDisplayAdded);
    electron.screen.removeListener('display-removed', onDisplayRemoved);
    electron.screen.removeListener('display-metrics-changed', onDisplayMetricsChanged);
}
