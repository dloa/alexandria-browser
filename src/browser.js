import app from 'app';
import BrowserWindow from 'browser-window';
import os from 'os';
import ipc from 'ipc';
import net from 'net';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

process.env.NODE_PATH = path.join(__dirname, 'node_modules');

var settingsjson = {};
try {
    settingsjson = JSON.parse(fs.readFileSync(path.join(__dirname, 'settings.json'), 'utf8'));
} catch (err) {}

var openURL = null;
app.on('open-url', function(event, url) {
    event.preventDefault();
    openURL = url;
});

app.on('ready', function() {

    var checkingQuit = false;
    var canQuit = false;
    var screen = require('screen');
    var size = screen.getPrimaryDisplay().workAreaSize;

    var windowSize = {
        width: 800,
        height: 870
    }

    if (size.height < 870) {
        windowSize.width = '800';
        windowSize.height = '600';
    }

    var mainWindow = new BrowserWindow({
        width: windowSize.width,
        height: windowSize.height,
        'standard-window': true,
        resizable: true,
        frame: true,
        show: true
    });

    mainWindow.loadUrl('file://' + process.cwd() + '/index.html');


    mainWindow.webContents.on('new-window', function(e) {
        e.preventDefault();
    });

    mainWindow.webContents.on('will-navigate', function(e, url) {
        if (url.indexOf('build/index.html#') < 0) {
            e.preventDefault();
        }
    });

    mainWindow.webContents.on('did-finish-load', function() {
        mainWindow.setTitle('ΛLΞXΛNDRIΛ Librarian');
        mainWindow.show();
        mainWindow.focus();
    });


});