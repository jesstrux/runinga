'use strict';

const {app, BrowserWindow, dialog, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const tinycolor = require("tinycolor2");

app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

let mainWindow, detailWindow;
// module.exports = {
//     mainWindow : mainWindow,
//     detailWindow: detailWindow
// };

app.on('ready', function(){
    mainWindow = new BrowserWindow({
        icon: path.join(__dirname, 'tv.jpg'),
        backgroundColor: '#F0F0F0',
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


    detailWindow = new BrowserWindow({
        backgroundColor: '#000',
        height: 330, width: 500,
        frame: false, 
        show: false,
        resizable: false,
        modal: true,
        parent: mainWindow
    });

    detailWindow.loadURL(`file://${__dirname}/detail.html`);

    detailWindow.on('closed', function () {
        detailWindow = null;
    });
});


exports.openShowDetails = function (show) {
    detailWindow.show();
    detailWindow.webContents.send('view-show', show);
    // detailWindow.openDevTools();
}