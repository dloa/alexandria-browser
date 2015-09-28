require.main.paths.splice(0, 0, process.env.NODE_PATH);
import remote from 'remote';
import React from 'react';
import ipc from 'ipc';
import webUtil from './utils/WebUtil';
import request from 'request';
import path from 'path';
import Router from 'react-router';
import routes from './routes';
import routerContainer from './router';
import utils from './utils/Util';
import hub from './utils/HubUtil';

var app = remote.require('app');
var Menu = remote.require('menu');

// Init process
webUtil.addWindowSizeSaving();
webUtil.addLiveReload();
webUtil.disableGlobalBackspace();


var router = Router.create({
    routes: routes
});

router.run(Handler => React.render( < Handler / > , document.body));
routerContainer.set(router);

// Default Route
router.transitionTo('dashboard');
ipc.on('application:quitting', () => {});

// Event fires when the app receives a vpnht:// URL
ipc.on('application:open-url', opts => {
    console.log('open', opts);
});

module.exports = {
    router: router
};