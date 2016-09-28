const { app, autoUpdater, BrowserWindow, WebContents } = require("electron");
const os = require("os");
const fs = require("fs");
const path = require("path");

const UPDATE_SERVER_HOST = "updates-tellyprompt.herokuapp.com/";

function AppUpdater(window) {
    var self = this;
    this._window = window;

    if(!fs.existsSync(path.resolve(path.dirname(process.execPath), '..', 'update.exe'))) {
        console.log("Not squirrel-installed app. No auto-updating available.");
        return;
    }

    const version = app.getVersion();
    autoUpdater.addListener("update-available", (event) => {
        console.log("A new update is available");
    });
    autoUpdater.addListener("update-downloaded", (event, releaseNotes, releaseName, releaseDate, updateURL) => {
        console.log("Update downloaded: ", releaseNotes, releaseName, releaseDate, updateURL);
        window.webContents.send('update-notification', { 'releaseNotes': releaseNotes, 'releaseName': releaseName, 'releaseDate': releaseDate, 'updateURL': updateURL, 'message': "A new update is ready to be installed: Version " + releaseName + " is downloaded and will be automatically installed on exit."});
    });
    autoUpdater.addListener("error", (error) => {
        console.log(error);
    });
    autoUpdater.addListener("checking-for-update", (event) => {
        console.log("Checking for updates...");
    });
    autoUpdater.addListener("update-not-available", (event) => {
        console.log("Update not available.");
    });
    autoUpdater.setFeedURL(`https://${UPDATE_SERVER_HOST}/update/${os.platform()}_${os.arch()}/${version}`);

    window.webContents.once("did-frame-finish-load", (event) => {
        autoUpdater.checkForUpdates();
    });
}

module.exports = AppUpdater;