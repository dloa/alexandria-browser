if (location.protocol == 'app:') {
	var _ = require('underscore')
	var MIN_PERCENTAGE_LOADED = 0.5,
		MIN_SIZE_LOADED = 10 * 1024 * 1024,
		gui = require('nw.gui'),
		win = gui.Window.get(),
		os = require('os'),
		path = require('path'),
		mime = require('mime'),
		ScreenResolution = {
		get SD() {
			return window.screen.width < 1280 || window.screen.height < 720;
		},
		get HD() {
			return window.screen.width >= 1280 && window.screen.width < 1920 || window.screen.height >= 720 && window.screen.height < 1080;
		},
		get FullHD() {
			return window.screen.width >= 1920 && window.screen.width < 2000 || window.screen.height >= 1080 && window.screen.height < 1600;
		},
		get UltraHD() {
			return window.screen.width >= 2000 || window.screen.height >= 1600;
		},
		get QuadHD() {
			return window.screen.width >= 3000 || window.screen.height >= 1800;
		},
		get Standard() {
			return window.devicePixelRatio <= 1;
		},
		get Retina() {
			return window.devicePixelRatio > 1;
		}
	};

	var nativeMenuBar = new gui.Menu({ type: "menubar" });
	try {
		nativeMenuBar.createMacBuiltin("My App");
		win.menu = nativeMenuBar;
	} catch (ex) {
		console.log(ex.message);
	}

	(function resizeHiDPI (options) {
		// this is the 'do things with resolutions and size initializer
		var zoom = 0;
		var screen = window.screen;

		if (ScreenResolution.QuadHD) {
			zoom = 2;
		} else if (ScreenResolution.UltraHD || ScreenResolution.Retina) {
			zoom = 1;
		}

		var width = parseInt(localStorage.width ? localStorage.width : 1024);
		var height = parseInt(localStorage.height ? localStorage.height : 768);
		var x = parseInt(localStorage.posX ? localStorage.posX : -1);
		var y = parseInt(localStorage.posY ? localStorage.posY : -1);

		// reset app width when the width is bigger than the available width
		if (screen.availWidth < width) {
			console.info('Window too big, resetting width');
			width = screen.availWidth;
		}

		// reset app height when the width is bigger than the available height
		if (screen.availHeight < height) {
			console.info('Window too big, resetting height');
			height = screen.availHeight;
		}

		// reset x when the screen width is smaller than the window x-position + the window width
		if (x < 0 || (x + width) > screen.width) {
			console.info('Window out of view, recentering x-pos');
			x = Math.round((screen.availWidth - width) / 2);
		}

		// reset y when the screen height is smaller than the window y-position + the window height
		if (y < 0 || (y + height) > screen.height) {
			console.info('Window out of view, recentering y-pos');
			y = Math.round((screen.availHeight - height) / 2);
		}

		win.zoomLevel = zoom;
		win.resizeTo(width, height);
		win.moveTo(x, y);
	})();

	win.on('resize', function (width, height) {
		localStorage.width = Math.round(width);
		localStorage.height = Math.round(height);
	});

	win.on('move', function (x, y) {
		localStorage.posX = Math.round(x);
		localStorage.posY = Math.round(y);

	});

	// Wipe the tmpFolder when closing the app (this frees up disk space)
	win.on('close', function () {
		if (Settings.get('deleteTmpOnClose')) {
			deleteFolder(Settings.get('tmpLocation'));
		}
		deleteFolder(path.join(os.tmpDir(), 'torrent-stream'));
		win.close(true);
	});

	// Developer Shortcuts
	Mousetrap.bind(['shift+f12', 'f12', 'command+0'], function (e) {
		win.showDevTools();
	});
	Mousetrap.bind(['shift+f10', 'f10', 'command+9'], function (e) {
		console.log('Opening: ' + Settings.get('tmpLocation'));
		gui.Shell.openItem(Settings.get('tmpLocation'));
	});
	Mousetrap.bind('mod+,', function (e) {
		Vent.trigger('about:close');
		Vent.trigger('settings:show');
	});
	Mousetrap.bind('f11', function (e) {
		var spawn = require('child_process').spawn,
			argv = gui.App.fullArgv,
			CWD = process.cwd();

		argv.push(CWD);
		spawn(process.execPath, argv, {
			cwd: CWD,
			detached: true,
			stdio: ['ignore', 'ignore', 'ignore']
		}).unref();
		gui.App.quit();
	});
	Mousetrap.bind(['?', '/', '\''], function (e) {
		e.preventDefault();
		Vent.trigger('keyboard:toggle');
	});
	Mousetrap.bind('shift+up shift+up shift+down shift+down shift+left shift+right shift+left shift+right shift+b shift+a', function () {
		$('body').addClass('knm');
	});
	if (process.platform === 'darwin') {
		Mousetrap.bind('command+ctrl+f', function (e) {
			e.preventDefault();
			win.toggleFullscreen();
		});
	} else {
		Mousetrap.bind('ctrl+alt+f', function (e) {
			e.preventDefault();
			win.toggleFullscreen();
		});
	}

	/**
	 * Show 404 page on uncaughtException
	 */
	process.on('uncaughtException', function (err) {
		window.console.error(err, err.stack || false);
	});
	
	function checkServiceIsRunning(service, url){
		var request = require ('request'),
		    App = require("nw.gui").App;
	
		return new Promise (function (accept, reject) {
			request (url, function (err, res, data) {
				if (err)
					return reject (err)
				return accept (data)
			})
		}).then(function (data) {
			App.emit(service + ':connected');
		}).catch (function () {
			App.emit(service + ':disconnected');
		});
	}
	
	function connectionHandler(className) {
		var App = require("nw.gui").App;
		var connected = false;
	
		function setClassToState(className, state) {
			var cs = $('#cs-' + className)
			cs.removeClass('connected connecting disconnected disconnecting')
			cs.addClass(state)
		}
	
		window['toggle' + className.toUpperCase()] =  function (e) {
			var next = (connected)?"disconnect":"connect";
			var emit = className + ":" + next;
	
			setClassToState (className, next + 'ing')
			console.error ("TOGGLE", className, emit)
		}
	
		App.on (className + ":connect", function() {
			debugger;
		})
	
		App.on (className + ":disconnect", function() {
			debugger;
		})
	
		App.on (className + ":connected", function() {
			console.log (className + " connect")
			setClassToState (className, 'connected')
		})
	
		App.on (className + ":disconnected", function() {
			console.log (className + " disconnect")
			setClassToState (className, 'disconnected')
		})
	}
	
	var deamons = {
		'ipfs': 'http://localhost:5001/api/v0/version',
		'libraryd': 'http://localhost:41289/alexandria/v1/publisher/get/all',
		'florincoin': 'http://localhost:41289/alexandria/v1/publisher/get/all'
	};
	
	Object.keys(deamons).map (function (service) {
		connectionHandler (service)
		setInterval (function () {
			checkServiceIsRunning(service, deamons[service])
		}, 1000)
	})
	
	/* 
	var ADH = require('alexandria-daemon-handler');
	var IPFSHandler     = new ADH('ipfs');
	var LibrarydHandler = new ADH('libraryd');
	
	IPFSHandler()
		.then(LibrarydHandler)
		.catch (function (err) {
			console.error('there was a fatal1 issue launching daemons');
		})
	
	*/
}