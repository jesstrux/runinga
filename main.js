'use strict';

const {app, BrowserWindow, Menu, ipcMain} = require('electron');
const path = require('path');

app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

let mainWindow, showDetailWindow, trailerWindow, dateWindow, prefsWindow;
const closeTemplate = [{
    label: 'File',
    submenu: [
        {label: 'Paste', role: 'paste'},
        {
            label: 'Close', 
            accelerator: 'Esc',
            click (item, focusedWindow) {
                focusedWindow.close();
            }
        },
        {
            label: 'DevTools', 
            accelerator: 'F12',
            click (item, focusedWindow) {
                focusedWindow.toggleDevTools();
            }
        },
        {
            label: 'Reload', 
            accelerator: 'F5',
            click (item, focusedWindow) {
                focusedWindow.reload();
            }
        }
    ]
}];
const menu = Menu.buildFromTemplate(closeTemplate);

app.on('ready', function(){
    openMainWindow();
    // openDetailsWindow();
    // showDatePicker();
    // openPrefsWindow();
    // openTrailerWindow("gJYXctDSIl8");

    ipcMain.on('manage-window', function(e, data){
        manageWindow(data);
    });

    ipcMain.on('pick-date', function(e){
        showDatePicker();
    });

    ipcMain.on('date-picked', function(e, date){
        dateWindow.close();
        mainWindow.webContents.send('date-picked', date);
    });

    ipcMain.on('open-show-details', function(e, show){
        openDetailsWindow(show);
    });

    ipcMain.on('open-settings', function(e){
        openPrefsWindow();
    });

    ipcMain.on('view-trailer', function(e, video_id){
        openTrailerWindow(video_id);
    });
});

function openMainWindow() {
    mainWindow = new BrowserWindow({
        icon: path.join(__dirname, 'icon.png'),
        backgroundColor: '#F0F0F0',
        height: 600, width: 960,
        frame: false, 
        show: false,
        resizable: false
    });

    mainWindow.setMenu(menu);

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.once('ready-to-show', function() {
      mainWindow.show()
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

function openDetailsWindow(data){
    showDetailWindow = new BrowserWindow({
        backgroundColor: '#000',
        height: 330, width: 500,
        frame: false, 
        show: false,
        resizable: false,
        modal: true,
        parent: mainWindow
    });

    showDetailWindow.setMenu(menu);

    showDetailWindow.loadURL(`file://${__dirname}/detail.html`);

    showDetailWindow.on('closed', function () {
        showDetailWindow = null;
    });

    showDetailWindow.once('ready-to-show', function() {
      showDetailWindow.show();
      // show.poster = null;
      showDetailWindow.webContents.send('view-show', data);
    });
}

function openTrailerWindow(video_id){
    trailerWindow = new BrowserWindow({
        backgroundColor: '#000',
        height: 360, width: 640,
        useContentSize: true,
        frame: false, 
        show: false,
        resizable: false,
        modal: true,
        parent: showDetailWindow
    });
    trailerWindow.setMenu(menu);

    trailerWindow.loadURL(`file://${__dirname}/trailer.html`);

    trailerWindow.once('ready-to-show', function() {
      trailerWindow.show();
      trailerWindow.webContents.send('load-trailer', video_id);
    });
}

function showDatePicker(){
    dateWindow = new BrowserWindow({
        backgroundColor: '#000',
        height: 320, width: 320,
        useContentSize: true,
        frame: false, 
        show: false,
        resizable: false,
        modal: true,
        parent: mainWindow
    });
    dateWindow.setMenu(menu);

    dateWindow.loadURL(`file://${__dirname}/date-picker.html`);

    dateWindow.once('ready-to-show', function() {
      dateWindow.show()
    });
}

function openPrefsWindow() {
    prefsWindow = new BrowserWindow({
        icon: path.join(__dirname, 'icon.png'),
        backgroundColor: '#F0F0F0',
        height: 380, width: 300,
        frame: false,
        show: false,
        modal: true,
        parent: mainWindow,
        resizable: false
    });
    prefsWindow.setMenu(menu);
    prefsWindow.loadURL(`file://${__dirname}/prefs.html`);

    prefsWindow.once('ready-to-show', function() {
      prefsWindow.show()
    });

    prefsWindow.on('closed', function () {
        prefsWindow = null;
    });

    // PREFS WINDOW
    ipcMain.on('shows-cache-cleared', function(e){
        prefsWindow.webContents.send('shows-uncached');
    });

    ipcMain.on('clear-shows-cache', function(e){
        mainWindow.webContents.send('clear-shows-cache');
    });

    ipcMain.on('favorites-cleared', function(e){
        prefsWindow.webContents.send('favorite-shows-cleared');
    });

    ipcMain.on('clear-favorites', function(e){
        mainWindow.webContents.send('clear-favorites');
    });

    ipcMain.on('prefs-changed', function(e, newprefs){
        mainWindow.webContents.send('prefs-changed', newprefs);
    });
}

function manageWindow(data){
    const windowsMap = {
        "main": mainWindow, "show-detail": showDetailWindow,
        "trailer": trailerWindow,
        "date-picker": dateWindow, "prefs" : prefsWindow
    };

    let win = windowsMap[data.win];

    if(data.action == "close")
        win.close();
    else if(data.action == "minimize")
        win.minimize();
}