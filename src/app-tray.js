import Menu from 'menu';
import MenuItem from 'menu-item';
import Tray from 'tray';
import ipc from 'ipc';

var trayMenu = null;

// Define a function to set up our tray icon
exports.init = function(helper) {

	// Disconnected State
	trayMenu = new Menu();
	trayMenu.append(new MenuItem({
		label: 'Toggle ΛLΞXΛNDRIΛ Librarian',
		click: helper.toggleVisibility
	}));
	trayMenu.append(new MenuItem({
		type: 'separator'
	}));
	
	
	trayMenu.append(new MenuItem({
		label: 'Quit',
		click: helper.quit
	}));



	var tray = new Tray(__dirname + '/images/icons/tray.png');
	tray.setContextMenu(trayMenu);

	tray.on('clicked', helper.toggleVisibility);

	

};
