var _ = require('underscore')

if (location.protocol == 'app:') {
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
}

function connectionHandler(className) {
	var App = require("nw.gui").App;
	var connected = false;

	window['toggle' + className.toUpperCase()] =  function (e) {
		var next = (connected)?"disconnect":"connect";
		var emit = className + ":" + next;
		var cs = $('#cs-' + className)
		cs.removeClass('connected connecting disconnected disconnecting')
		cs.addClass(next + 'ing')

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
	})

	App.on (className + ":disconnected", function() {
		console.log (className + " disconnect")
	})

	var spawn = require('child_process').spawn,
	    CWD = process.cwd();

	return console.log ('+++++++', CWD)

	spawn(process.execPath, argv, {
		cwd: CWD,
		detached: true,
		stdio: ['ignore', 'ignore', 'ignore']
	}).unref();
}

function findInCommonPath (binary){
	return new Promise (function (accept, reject) {
		var fs = require('fs'),
		    path = require('path'),
		    expand = require('expand-home-dir')
		    App  = require("nw.gui").App;

		var commonPath = [
			App.dataPath,
			'/usr/bin/',
			'/usr/local/bin',
			'~/.local/bin/',
			'~/bin/',
		];

		var promises = commonPath.map(function (p) {
			var f = expand(path.join (p, binary))
			console.log ('looking for', binary, '@', f)
			return new Promise (function (accept, reject) {
				fs.access(f, fs.X_OK, function (err) {
					console.log(f, err ? 'no access!' : 'looks good');
					// HACK:xaiki, the native promise's all only
					// supports agregating accepts, so here we
					// allways accept and will look at the value
					// later (in the all function).
					return err ? accept (false) : accept (f);
				})
			})
		})

		Promise.all(promises)
			.catch (function (e, v) {
				/* error */
				return reject (e);
			}).then(function (res){
					/* no error,
					   false: not found,
					   url: found something executable
					*/
				var bins = _.filter(res, function (v) {
					return v;
				})

				console.log (bins)
				bins.length ? accept (bins) : reject (false)
			});
	})
}

/* XXX:xaiki this is a really stupid simple lambda */
function lambda (func, args) {
	return function () {
		args = (args instanceof Array)?args:[args]
		return func.apply(this, args);
	}
}

function runAndMonitor (bin, args) {
	var CP = require('child_process')

	var h = CP.spawn(bin, args);
	['stdout', 'stderr'].map (function (channel) {
		h[channel].on('data', function (data) {
			console.log (channel, data.toString())
		})
	})

	h.on ('error', function (err) {
		console.error ('error', err)
	})

	h.on ('exit', function (code, signal) {
		console.error ('exit', code, signal)
	})

	h.on ('close', function (code, signal) {
		console.error ('close', code, signal)
	})

	h.on ('disconnect', function () {
		console.error ('disconnect')
	})

	h.on ('message', function () {
		console.error ('message')
	})

	return h;
}

function FindAndStart (bin, args) {
	return findInCommonPath (bin)
		.then(function (bins)  {
			var bin;
			while (bins.length) {
				bin = bins.pop()
				try {
					return runAndMonitor(bin, args);
				} catch (e) {
					console.log ('error starting', bin, args, e);
				}
			}
			return bin;
		})
}

function IPFSHandler() {
	var App  = require('nw.gui').App,
	    expand = require('expand-home-dir'),
	    fs = require ('fs');

	getFromIPFS("QmVwmB7kVhGLkasSJmgNxisv5fwtH3bGA3UepiGvG5XTWM/ipfs",
		    expand (path.join ("~/bin/", "ipfs")))
		.then(function (path) {
			fs.chmodSync (path, 0770)
			console.log ('got from IPFS at', path)
		})
}

function getFromIPFS(hash, dest) {
	return getIPFShost()
		.then(function (host) {return getFromIPFSHost (host, hash, dest)})
}

function getIPFShost() {
	var request = require ('request'),
	    api  = 'http://localhost:5001/api/v0/version',
	    host = 'http://localhost:8080/ipfs';

	return Promise.resolve(request({url: api, json: true}))
		.then(function (data) {
			console.log ('got IPFS runing, do nothing', data);
			return host;
		})
		.catch (function () {
			return Promise.resolve (FindAndStart ('ipfs', ['daemon']))
				.then(function () {
					return api;
				})
		})
		.catch (function () {
			console.log ('no local ipfs binary found,',
				     'using the web gateway.');
			return 'http://ipfs.alexandria.media/ipfs'
		});
}

function getFromIPFSHost (host, path, dest) {
	var progress = require ('request-progress'),
	    request  = require ('request'),
	    fs       = require ('fs');

	return new Promise( function (accept, reject) {
		progress(request(host + '/' + path))
			.on('progress', function (state) {
				console.log('received size in bytes', state.received);
				console.log('total size in bytes', state.total);
				console.log('percent', state.percent);
			})
			.on('error', function (err) {
				console.log ('error', err)
				reject (err);
			})
			.pipe(fs.createWriteStream(dest))
			.on('error', function (err) {
				console.log ('error', err)
				reject (err);
			})
			.on('close', function (err) {
				console.log ('done', err)
				accept(dest)
			})
	})
}

function LibraryDHandler() {
	var App = require ('nw.gui').App;
	getFromIPFS("QmVwmB7kVhGLkasSJmgNxisv5fwtH3bGA3UepiGvG5XTWM/libraryd",
		    path.join (App.dataPath, "/libraryd"))
	.then(lamda ());
}

connectionHandler ('ipfs')
connectionHandler ('libraryd')

IPFSHandler()
//LibraryDHandler()
