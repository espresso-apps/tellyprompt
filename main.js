/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Tim Jenkins. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const {app, BrowserWindow, ipcMain} = require("electron");
const windowStateKeeper = require("electron-window-state");

const baseHtmlDir = `file://${__dirname}/electron/`;

var editorWindow = null;
var presenterWindow = null;
var displayWindow = null;
var settingsWindow = null;
var helpWindow = null;

var showDevTools = false;

var windowIcon = `file://${__dirname}/icons/icon_128.png`;

if(process.platform === 'win32') {
    windowIcon = `file://${__dirname}/icons/tellyprompt.ico`;
}

for(var i = 0; i < process.argv.length; i++) {
    if(process.argv[i] === "--show-dev-tools") {
        showDevTools = true;
    }
}

app.on("window-all-closed", function() {
    // macOS app doesn't quit unless user explicitly quits from menu
    if(process.platform != 'darwin') {
        app.quit();
    }
});

ipcMain.on('close-this-window', (event) => {
    let wnd = BrowserWindow.fromWebContents(event.sender);
    wnd.close();
});

ipcMain.on('show-settings', (event) => {
    if(settingsWindow !== null) {
        settingsWindow.show();
        return;
    }

    let parentWindow = BrowserWindow.fromWebContents(event.sender);

    settingsWindow = new BrowserWindow({
        width: 768, 
        height: 400, 
        useContentSize: true, 
        show: false, 
        title: "Settings", 
        skipTaskbar: true, 
        parent: parentWindow, 
        modal: true, 
        minimizable: false, 
        maximizable: false, 
        resizable: false,
        type: "dialog"
    });
    
    if(showDevTools) settingsWindow.webContents.openDevTools();
    if(!showDevTools) settingsWindow.setMenu(null);
    settingsWindow.loadURL(baseHtmlDir + "settings.html");
    settingsWindow.once('ready-to-show', () => {
        settingsWindow.show();
    });
    settingsWindow.on("closed", () => {
        settingsWindow = null;
    });
});

ipcMain.on('show-help', (event) => {
    if(helpWindow !== null) {
        helpWindow.show();
        return;
    }

    helpWindow = new BrowserWindow({
        width: 768, 
        height: 700, 
        useContentSize: true, 
        show: false, 
        title: "Help - TellyPrompt",
        icon: windowIcon
    });
    
    if(showDevTools) helpWindow.webContents.openDevTools();
    if(!showDevTools) helpWindow.setMenu(null);
    helpWindow.loadURL(baseHtmlDir + "help.html");
    helpWindow.once('ready-to-show', () => {
        helpWindow.show();
    });
    helpWindow.on("closed", () => {
        helpWindow = null;
    });
});

ipcMain.on('show-presenter', (event, settings) => {
    if(presenterWindow !== null) {
        presenterWindow.show();
        return;
    }

    let presenterWindowState = windowStateKeeper({
        defaultWidth: 1000,
        defaultHeight: 600
    });

    presenterWindow = new BrowserWindow({
        width: presenterWindowState.width,
        height: presenterWindowState.height,
        show: false,
        fullscreenable: true,
        backgroundColor: "#000",
        experimentalFeatures: true,
        blinkFeatures: "CSSOMSmoothScroll",
        icon: windowIcon
    });
    presenterWindow.on("closed", () => {
        presenterWindow = null;
        if(displayWindow !== null) {
            displayWindow.close();
        }
    });
    presenterWindow.once("ready-to-show", () => {
        presenterWindow.show();
    });
    if(showDevTools) presenterWindow.webContents.openDevTools();
    if(!showDevTools) presenterWindow.setMenu(null);
    presenterWindow.loadURL(baseHtmlDir + "presenter.html");
    presenterWindowState.manage(presenterWindow);
});

ipcMain.on('show-display', (event, settings) => {
    if(displayWindow !== null) {
        displayWindow.show();
        return;
    }

    displayWindow = new BrowserWindow({
        width: settings.bounds.width,
        height: settings.bounds.height,
        x: settings.bounds.x,
        y: settings.bounds.y,
        show: false,
        skipTaskbar: true,
        fullscreen: true,
        frame: false,
        parent: presenterWindow.id,
        title: "Display - TellyPrompt",
        backgroundColor: (settings.backgroundColor ? settings.backgroundColor : "#000"),
        icon: windowIcon
    });
    displayWindow.on("closed", () => {
        if(presenterWindow !== null) {
            presenterWindow.webContents.send("display-closed");
        }
        displayWindow = null;
    });
    displayWindow.once("ready-to-show", () => {
        displayWindow.show();
    });
    displayWindow.once("show", () => {
        if(presenterWindow !== null) {
            presenterWindow.webContents.send("display-shown");
        }
    });
    if(showDevTools) displayWindow.webContents.openDevTools();
    if(!showDevTools) displayWindow.setMenu(null);
    displayWindow.loadURL(baseHtmlDir + "display.html");
});

ipcMain.on("close-display", (event) => {
    if(displayWindow === null) {
        return;
    }
    displayWindow.close();
});

ipcMain.on("to-display", (event, msg) => {
    if(displayWindow === null) return;
    displayWindow.webContents.send("to-display", msg);
});

ipcMain.on("to-presenter", (event, msg) => {
    if(presenterWindow === null) return;
    presenterWindow.webContents.send("to-presenter", msg);
});

app.on("ready", function() {
    let editorWindowState = windowStateKeeper({
        defaultWidth: 1000,
        defaultHeight: 600
    });

    editorWindow = new BrowserWindow({ 
        'width': editorWindowState.width, 
        'height': editorWindowState.height, 
        'show': false,
        "title": "TellyPrompt",
        "icon": windowIcon });
    editorWindow.on("closed", () => {
        editorWindow = null;
        if(presenterWindow !== null) {
            presenterWindow.close();
        }
        if(helpWindow !== null) {
            helpWindow.close();
        }
    });
    editorWindow.once('ready-to-show', () => {
        editorWindow.show();
    });
    if(showDevTools) editorWindow.webContents.openDevTools();
    if(!showDevTools) editorWindow.setMenu(null);
    editorWindow.loadURL(baseHtmlDir + "editor.html");

    editorWindowState.manage(editorWindow);
});