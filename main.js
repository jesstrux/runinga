'use strict';

const {app, BrowserWindow, dialog} = require('electron');
const path = require('path');
const url = require('url');
const tinycolor = require("tinycolor2");


app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

let mainWindow;
module.exports.mainWindow = mainWindow;

app.on('ready', function(){
    mainWindow = new BrowserWindow({
        icon: path.join(__dirname, 'icon.png'),
        // backgroundColor: '#F0F0F0',
        backgroundColor: '#000',
        // height: 500, width: 700, 
        height: 600, width: 900,
        frame: false, 
        show: false,
        resizable: false
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
    }));

    mainWindow.once('ready-to-show', function() {
      mainWindow.show()
    });

    // mainWindow.openDevTools();
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
});