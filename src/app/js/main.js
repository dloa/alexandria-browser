/* some global variables to make mistakes only once */

var serverAddress = 'libraryd.alexandria.io'; // Dev
// var serverAddress = 'localhost';

var IPFSserver = 'ipfs.alexandria.io';
// var IPFSserver = 'localhost:8080';

if (location.protocol == 'app:') {
	var bitcoin = require('bitcoin');
	$('.webOnly').remove();
	$('.appOnly').css('display','inline-block');	
	var fs = require('fs-extra');
} else {
	$('.webOnly').css('display','inline-block');
	$('.appOnly').remove();
	var wallet;
}

var prevTipAmount = '';
var fadeTimer = 200;

var routes = {};

var FLOCost;
var FLOLTC;
var LTCUSD;
var FLOUSD;
var BTCUSD;
var cryptoTimerId = 0;
var connectingTimerId = 0;
var navCounter = 0;

jQuery(document).ready(function($){

	replaceSVG();
	
	if (location.protocol != 'app:') {
		FloVaultInit();
	}


	loadAlexandria();
	
	// RUN SEARCH
	$('#search-main').on("keyup", function(e) {
		var code = e.keyCode || e.which;
		if (code == 13) {
			fullSearch(document.getElementById('search-main').value);
		}
	});

	$('#searchTermInput').on("keyup", function(e) {
		var code = e.keyCode || e.which;
		if (code == 13) {
			buildSearch();
		}
	});

	$('#go-to-input').on("keyup", function(e) {
		var code = e.keyCode || e.which;
		if (code == 13) {
			goToLocation();
		}
	});
	
	// CLEAR SEARCH
	$('.clearSearch').click(function(){
		$(this).siblings('input[type="text"]').val('');
	});

	// Advanced Search toggle
	$('#adv-search-toggle').click(function(){
		$('#adv-search .module-links a').removeClass('active');
		$('#go-modal').fadeOut(fadeTimer);
		$('#adv-search').fadeToggle(fadeTimer);
	});

	// Toggle modal on off-modal click
	$('body').on('click', function(e){		
		if ( ($(e.target).attr('id') != 'adv-search') && (!$(e.target).parents('#adv-search')[0]) && ($(e.target).attr('id') != 'adv-search-toggle') ) {			
			if($('#adv-search').css('display') == 'block') {
				$('#adv-search').fadeToggle(fadeTimer);
			}
		}
		if ( ( ($('#info-modal-media').css('display') == 'block') && ($('#info-modal-media').css('opacity') == 1) ) && ( (!$(e.target).parents('#info-modal-media')[0]) && ( (!$(e.target).parents('.info-icon')[0]) ) ) ) {
			$('#info-modal-media').fadeOut(fadeTimer);
		}
		if ( ( ($('#info-modal-small').css('display') == 'block') && ($('#info-modal-small').css('opacity') == 1) ) && ( (!$(e.target).parents('#info-modal-small')[0]) && ( (!$(e.target).parents('.info-icon')[0]) ) ) ) {
			$('#info-modal-small').fadeOut(fadeTimer);
		}
		if ( ( ($('#tip-modal').css('display') == 'block') && ($('#tip-modal').css('opacity') == 1) ) && ( (!$(e.target).parents('#tip-modal')[0]) && ( (!$(e.target).parents('.tip-icon')[0]) ) ) ) {
			$('#tip-modal').fadeOut(fadeTimer);
		}
		if ( (document.getElementById('bitmsg-modal').style.display == 'block') && ( (!$(e.target).parents('#bitmsg-modal')[0]) && (!$(e.target).parents('.bitmsg-icon')[0]) ) ) {
			document.getElementById('bitmsg-modal').style.display = 'none';
		}
		if ( ( ($('#share-modal').css('display') == 'block') && ($('#share-modal').css('opacity') == 1) ) && ( (!$(e.target).parents('#share-modal')[0]) && ( (!$(e.target).parents('.share-icon')[0]) ) ) ) {
			$('#share-modal').fadeOut(fadeTimer);
		}
		if ( ( ($('#user-modal').css('display') == 'block') && ($('#user-modal').css('opacity') == 1) ) && ( (!$(e.target).parents('#user-modal')[0]) && ( (!$(e.target).parents('#app-user-icon')[0]) ) ) ) {
			$('#user-modal').fadeOut(fadeTimer);
		}
		if ( ( ($('#add-menu-modal').css('display') == 'block') && ($('#add-menu-modal').css('opacity') == 1) ) && ( (!$(e.target).parents('#add-menu-modal')[0]) && ( (!$(e.target).parents('#addNewContent-icon')[0]) ) ) ) {
			$('#add-menu-modal').fadeOut(fadeTimer);
		}
	});
	
	// Modal controls
	$(document).on("keyup", function (e) {
		var code = e.keyCode || e.which;
		if (code == 27) {
			// esc pressed
			if ($('#lightbox').css('display') == 'block') {
				$('#lightbox video').trigger('pause');
				$('#lightbox').fadeOut(fadeTimer);
				$('#lightbox video').css({
					'top': '100%',
					'left': '100%'
				});
			}
			if($('#wait').css('display') == 'block') {
				document.getElementById('wait').style.display = 'none';
				document.getElementById('disabler').style.display = 'none';
			}
			if($('#user-modal.abs').css('display')=='block'){
				$('#user-modal.abs').fadeOut(fadeTimer);
			}
			if($('#add-menu-modal.abs').css('display')=='block'){
				$('#add-menu-modal.abs').fadeOut(fadeTimer);
			}
			$('.overlay-modal').each(function(){
				if ($(this).css('display')=='block'){
					hideOverlay();
				}
			});
			$('.bubble-modal').each(function(){
				if ($(this).css('display')=='block'){
					$(this).hide();
				}
			});
			$('.info-modal').each(function(){
				if ($(this).css('display')=='block'){
					$(this).hide();
				}
			});
		}
	});
	
	$('#lightbox').click(function(e){
		if ($(e.target).attr('id') == 'lightbox') {
			$('#lightbox video').trigger('pause');
			$(this).fadeOut(fadeTimer);
			$('#lightbox video').css({
				'top': '100%',
				'left': '100%'
			});
		}
	});

	$('input[name="dNetwork"]').click(function(){
		if ($(this)[0]['checked']) {
			$(this).siblings('.input-container').slideDown(fadeTimer);
			resizeTabs(true, fadeTimer);
		} else {
			$(this).siblings('.input-container').slideUp(fadeTimer);
			resizeTabs(true, fadeTimer);
		}
	});

	// Alexandria Theme UI interactions
	$('.alex-switch').click(function(){
		$(this).toggleClass('switched-on');
	});
	
	// Tip Modal Tabs
	$('.modal-tabs li').click(function(){
		$(this).addClass('active').siblings().removeClass('active');
		$('.modal-tab#'+$(this).attr("name")).show().siblings('.modal-tab').hide();
	});

	// API Server ID and Control
	if(serverAddress == 'libraryd.alexandria.io'){
		$('#serverID').text('Gateway');
	} else {
		$('#serverID').text('Local');
	}
	if (location.protocol == 'app:') {
		$('#serverID').click(function(){
			if(serverAddress == 'libraryd.alexandria.io'){
				serverAddress = 'localhost';
				IPFSserver = 'localhost:8080';
				$('#serverID').text('Local');
			} else {
				serverAddress = 'libraryd.alexandria.io'
				IPFSserver = 'ipfs.alexandria.io';
				$('#serverID').text('Gateway');
			}
			setMediaTypeFilter();
			console.log(serverAddress);
			console.log(IPFSserver);
		});
	} else {
		if (IPFSserver == 'ipfs.alexandria.io') {
			$('#IPFS-switch').text('IPFS: Gateway');
		} else {
			$('#IPFS-switch').text('IPFS: Local');
		}
		$('#IPFS-switch').click(function(){
			if(IPFSserver == 'ipfs.alexandria.io'){
				IPFSserver = 'localhost:8080';
				$('#IPFS-switch').text('IPFS: Local');
			} else {
				IPFSserver = 'ipfs.alexandria.io';
				$('#IPFS-switch').text('IPFS: Gateway');
			}
			setMediaTypeFilter();
		});
	}
	
	// SET LOADED VALUE
	var loadedTimer = setTimeout(function(){
		document.getElementById('loaded').innerHTML = '1';
	}, 3000);

	// Get exchange rates
	getCryptos();

}); // End Document.Ready

// The route registering function:
function route (path, templateId, controller) {  
  routes[path] = {templateId: templateId, controller: controller};
}
route('/', 'front', function () {  });  
route('/media', 'media', function () {  });
route('/publishers', 'publishers', function () {  });
route('/publisher', 'publisher', function () {  });
route('/add-media', 'add-media', function () {  });
route('/add-publisher', 'add-publisher', function () {  });
route('/search', 'search', function () {  });
route('/about', 'about', function () {  });
route('/wallet', 'wallet', function () { });

var el = null;  
function router (event, goUrl) {  
    // Current route url (getting rid of '#' in hash as well):
    var url = location.hash.slice(1) || '/';
  	console.info(event);
  	console.info(goUrl);
  	if (goUrl) {
		url = goUrl.split('#')[1];
  	}
	var paths = url.split('/');
	if (paths[1] != '') {
		var module = '/'+paths[1];
	} else {
		var module = url;
	}
	console.info(paths);
    // Get route by url:
    var route = routes[module];
    // Route the URL
    if ( (route) && (route.controller) ) {
    	currentView = route.templateId;
    	if (route.templateId == 'front') {
    		resetAlexandria();
    		return false;
    	}
		resetInterface();
    	if (route.templateId == 'media') {
			if (!paths[2]) {
				filterMediaByType();
			} else if (paths[2] == 'type') {
				var parseTypes = location.hash.split('type/')[1].split('-');
				console.info(parseTypes);
				var filterTypes = [];
				for (var i = 0; i < parseTypes.length; i++) {
					filterTypes.push(parseTypes[i]);
				}
				var filterTypesStr = (filterTypes.length < 2) ? (filterTypes) : ('');
				if (filterTypes.length > 1) {
					for (var i = 0; i < filterTypes.length; i++) {
						if (filterTypesStr == '') {
							filterTypesStr = '"'+ filterTypes[i]+'"';
						} else {
							filterTypesStr = filterTypesStr+',"'+ filterTypes[i]+'"';
						}
					}
				}
				var searchResults = searchAPI('media', 'type', filterTypesStr);
				var stateObj = {
					currentView: 'media',
					searchResults: false,
					mediaTypes: filterTypes,
					isFront: true
				}
				var titleStr = '';
				if (stateObj.mediaTypes[0]) {
					for (var i = 0; i < stateObj.mediaTypes.length; i++) {
						titleStr = (titleStr == '') ? (stateObj.mediaTypes[i].charAt(0).toUpperCase() + stateObj.mediaTypes[i].slice(1) + 's') : (titleStr + ' + ' + stateObj.mediaTypes[i].charAt(0).toUpperCase() + stateObj.mediaTypes[i].slice(1) + 's');
					}
					titleStr = ' > ' + titleStr;	
				}
				makeHistory(stateObj, 'ΛLΞXΛNDRIΛ > Media' + titleStr);
				for (var i = 0; i < filterTypes.length; i++) {
					$('#browse-media .module-links a[value="'+ filterTypes[i] +'"]').addClass('active');
				}
				populateSearchResults(searchResults, 'media');
			} else {
				if (paths[2] == 'search') {
					console.info(paths);
					var searchTerm = paths[paths.length-1].toString().replace("-"," ").split('?')[0];
					if (paths[4]) {
						var searchOn = paths[3];
					}
					var searchResults = (searchOn) ? (searchAPI(route.templateId, searchOn, searchTerm)) : (searchAPI(route.templateId, '*', searchTerm));
					if (location.hash.indexOf('types') != -1) {
						var parseTypes = location.hash.split('types=')[1].split('-');
						for (var i = 0; i < parseTypes.length; i++) {
							filterTypes.push(parseTypes[i]);
						}
					}
					var stateObj = {
						currentView: 'search',
						searchResults: true,
						searchOn: searchOn,
						searchTerm: searchTerm,
						module: 'media',
						isFront: true
					}
					if (searchOn) {
						stateObj.searchOn = searchOn;
						var titleStr = 'ΛLΞXΛNDRIΛ > Media > Search > ' + searchOn + ' > ' + searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
					} else {
						var titleStr = 'ΛLΞXΛNDRIΛ > Media > Search > '+ searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
					}
					makeHistory(stateObj, titleStr);
					populateSearchResults(searchResults, route.templateId);
				} else {
					var searchOn = paths[2].replace("-","_");
					if (searchOn.length == 64) {
						loadArtifactView();
					} else {
						console.info(paths);
						if ( (paths[2] == 'type') && (paths[3]) ) {
							var parseTypes = location.hash.split('type/')[1];
							var parseTypeLen = parseTypes.split('-');						
							if (parseTypeLen.length > 1) {
								var searchForStr = '';
								for (var i = 0; i < parseTypeLen.length; i++) {
									if (searchForStr == '') {
										searchForStr = '"'+ parseTypeLen[i]+'"';
									} else {
										searchForStr = searchForStr +',"'+ parseTypeLen[i]+'"';
									}
								}
								var searchFor = searchForStr;
							} else {
								var searchFor = [paths[3]];
							}
						} else if ((paths[2] != 'type') && (paths[3])) {
							var searchFor = paths[3].replace("-"," ");
						} else {
							var searchFor = '';
						}
						var searchResults = searchAPI(route.templateId, searchOn, searchFor);
						var stateObj = {
							currentView: 'media',
							searchResults: false,
							isFront: true							
						}
						console.info(stateObj);
						makeHistory(stateObj, 'ΛLΞXΛNDRIΛ > Media');
						populateSearchResults(searchResults, route.templateId);
					}
				}
			}
    	} else if ( (route.templateId == 'publishers') || (route.templateId == 'publisher') ) {
			console.info(paths[2]);
			if (!paths[2]) {
				getAllPublishers();
			} else {
				var searchResults;
				if (paths[2].length == 34)  {
					searchResults = searchAPI('publisher', 'address', paths[2]);
					loadPublisherView();
				} else if (paths[2].length == 64)  {
					searchResults = searchAPI('publisher', 'txid', paths[2]);
					loadPublisherView();
				} else {
					var searchTerm = paths[paths.length - 1].replace('-',' ');
					searchResults = searchAPI('publisher', 'name', searchTerm);
					populateSearchResults(searchResults, route.templateId);
					var stateObj = {
						currentView: 'publishers',
						searchResults: true,
						searchTerm: searchTerm
					}
					makeHistory(stateObj, 'ΛLΞXΛNDRIΛ > Publishers > Search > ' + searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1));
				}
			}
    	} else if (route.templateId == 'add-media') {
			loadShareMod();
    	} else if (route.templateId == 'add-publisher') {
			loadCreatePublisherMod();
    	} else if (route.templateId == 'search') {
    		console.info(paths[2]);
			var stateObj = {
				currentView: 'search',
				searchResults: true
			}
			stateObj.searchTerm = (paths[2]) ? (paths[2].toString().replace("-"," ").split('?')[0]) : ('');
    		fullSearch(stateObj.searchTerm);
    	} else if (route.templateId == 'about') {
    		loadAboutView();
    	} else if (route.templateId == 'wallet') {
    		loadWalletView();
    	}
    } else {
    	// ROUTE DOESN'T EXIST - IF ADDRESS LOAD PUBLISHER
    	console.info(paths[1]);
    	if (paths[1].length == 34) {
//			var searchResults = searchAPI('publisher', 'address', paths[1]);
			loadPublisherView(paths[1]);
    	} else if (paths[1].length == 64) {
			var searchResults = searchAPI('publisher', 'txid', paths[1]);
			if (!searchResults) {
				var thisMediaData = searchAPI('media', 'txid', paths[1]);
				var mediaType = thisMediaData[0]['media-data']['alexandria-media']['type'];
				console.info(mediaType);
				if (mediaType == 'music') {
					loadArtifactView2(paths[1]);
				} else {
					loadArtifactView(paths[1]);
				}
			} else {
				loadPublisherView(paths[1]);
			}
    	}
    }

}

// Listen on hash change:
window.addEventListener('hashchange', router);  

// Listen on page load:
window.addEventListener('load', router);

// TIMER FOR CHANGING EXCHANGE RATES
function changeCryptoRates() {
	if (cryptoTimerRunning == 1) {
		return false;
	} else {
		// set a timer and run search if done typing
		cryptoTimerRunning = 1;
		cryptoTimerId = setTimeout ( 'getCryptos()', 1000 );
	}
}

// GET CRYPTO EXCHANGE RATES
function getCryptos() {
	clearTimeout ( cryptoTimerId );
	cryptoTimerRunning = 0;
// Alexandria Crytpo Price
	$.ajax({
		url: 'http://colorcoin.org:41290/flo-market-data/v1/getAll',
//		url: 'http://localhost:41290/flo-market-data/v1/getAll',
		success: function(e) {
			console.info(e);
			var data = $.parseJSON(e);
			FLOUSD = data.USD;
			console.info(FLOUSD);
			$('#flo-usd label').text('FLO/USD').next('span').text(FLOUSD);
			FLOCost = parseFloat($('#flo-cost').text());
			$('#tip-modal .flo-usd-output').text(Math.round((1/FLOUSD)*100)/100);
			$('#newMedia-notary .flo-usd-output').text(Math.round((FLOUSD*FLOCost)*100000)/100000);					
			$('#tip-alexandria-modal .flo-usd-output').text(Math.round((document.getElementById('alexandria-tip-amount').value*FLOUSD)*100000)/100000);
			var pwywAmount = $('.pwyw-wall-amount:visible').val();
			$('.pwyw-wall-amount:hidden').val(pwywAmount);
			$('#pwyw-modal .flo-usd-output').text(Math.round((pwywAmount/FLOUSD)*100000)/100000);
		},
		error: function (xhr, ajaxOptions, thrownError) {
			console.error(xhr.status);
			console.error(thrownError);
		}
		
	});
// Bitcoin
	$.ajax({
	    url: 'https://api.bitcoinaverage.com/ticker/global/USD/',
	    success: function(e) {
			console.info(e);
			BTCUSD = parseFloat(e.last);
			console.info(BTCUSD);
			var pwywAmount = $('.pwyw-wall-amount:visible').val();
			$('.btc-usd .btc-usd-output').text(Math.round((1/BTCUSD)*100000000)/100000000);
			$('#pwyw-modal .btc-usd-output').text(Math.round((pwywAmount/BTCUSD)*100000)/100000);
		}
	});
}

// SVG GRAPHICS FOR APPEND
var infoIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="99.08px" height="100.002px" viewBox="0 0 99.08 100.002" enable-background="new 0 0 99.08 100.002" xml:space="preserve" class="replaced-svg"><path d="M49.539,0C22.188-0.01,0.018,22.381,0,50.023c0.018,27.601,22.188,49.993,49.539,49.979  c27.344,0.014,49.518-22.378,49.541-49.979C99.057,22.381,76.883-0.01,49.539,0z M49.512,21.634c4.372,0,7.922,3.546,7.922,7.922  s-3.55,7.923-7.922,7.923c-4.38,0-7.927-3.547-7.927-7.923S45.132,21.634,49.512,21.634z M61.117,74.787H38.169v-3.922h3.342  c0.48,0,0.873-0.396,0.873-0.881V44.711c0-0.484-0.389-0.881-0.873-0.881h-3.342v-3.795h18.466v29.567  c0,0.696,0.396,1.263,0.881,1.263h3.602V74.787z"></path></svg>';

var playIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20px" height="20px" viewBox="0 0 20 20" version="1.1" class="replaced-svg"><title>Play icon</title><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" type="MSPage"><g type="MSArtboardGroup" transform="translate(-722.000000, -262.000000)" fill="#979797"><path d="M732,282 C737.522847,282 742,277.522847 742,272 C742,266.477153 737.522847,262 732,262 C726.477153,262 722,266.477153 722,272 C722,277.522847 726.477153,282 732,282 Z M729.021277,267.319149 L736.680851,271.991489 L729.021277,276.664043 L729.021277,267.319149 Z" type="MSShapeGroup"></path></g></g></svg>';

var mediaIconSVGs = {
	'media':'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="125px" height="125px" viewBox="0 0 125 125" version="1.1" class="entity-image replaced-svg"><title>media icon</title><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" type="MSPage"><g type="MSArtboardGroup" transform="translate(-1177.000000, -692.000000)" fill="#A3CCB1"><g type="MSLayerGroup" transform="translate(504.000000, 252.000000)"><g transform="translate(545.000000, 351.000000)" type="MSShapeGroup"><path d="M232.627731,89.0157199 L235.27242,89.0157199 C236.797561,89.0157199 236.630879,88.8934989 236.630879,90.4170953 L236.630879,92.7490173 C236.630879,93.7281746 237.432341,94.5309446 238.412988,94.5309446 L245.688659,94.5309446 C246.667916,94.5309446 247.470768,93.7295635 247.470768,92.7490173 L247.470768,90.064321 C247.470768,88.947665 247.324921,89.0171088 248.450025,89.0171088 L251.980906,89.0171088 C253.132401,89.0171088 252.994889,88.9407207 252.994889,90.0879318 L252.994889,210.772881 C252.994889,214.518678 253.129623,213.968684 249.402891,213.968684 L245.755332,213.968684 L245.713661,213.968684 L238.43799,213.968684 L238.392152,213.968684 L234.491792,213.968684 C231.194266,213.968684 231.252605,214.500623 231.252605,211.179822 C231.252605,210.961768 231.233158,210.752048 231.18871,210.556217 L231.18871,208.429848 C231.18871,205.445155 228.746818,203.003511 225.76182,203.003511 L155.215032,203.003511 C152.230035,203.003511 149.788143,205.445155 149.788143,208.429848 L149.788143,211.995092 L149.788143,213.367301 C149.727026,214.028405 149.397829,213.967295 147.932416,213.967295 L146.150307,213.967295 C144.122342,213.967295 144.398756,214.064516 144.398756,212.045091 L144.398756,210.258997 C144.398756,209.278451 143.597294,208.47707 142.616648,208.47707 L135.340976,208.47707 C134.361719,208.47707 133.558867,209.278451 133.558867,210.258997 L133.558867,211.485374 C133.558867,213.643687 134.115863,213.967295 131.90177,213.967295 L130.018263,213.967295 C127.484696,213.967295 128.051415,213.76313 128.059749,211.277043 C128.231987,171.714924 128.048637,131.337535 128.045859,91.8170819 C128.045859,88.6448902 127.84584,89.0157199 131.030856,89.0157199 L135.020113,89.0157199 C135.118733,89.0323865 135.214576,89.0407197 135.315974,89.0407197 L142.591645,89.0407197 C142.693044,89.0407197 142.795831,89.0337753 142.894451,89.0157199 L147.214294,89.0157199 C149.307543,89.0157199 149.720081,88.880999 149.788143,89.9226557 L149.788143,91.6406947 L149.788143,94.4351122 C149.788143,97.4198057 152.230035,99.8614489 155.215032,99.8614489 L225.764598,99.8614489 C228.749596,99.8614489 231.191488,97.4198057 231.191488,94.4351122 L231.191488,91.0045897 C231.234547,90.7434811 231.255383,90.465706 231.255383,90.1615423 C231.253994,88.7768334 231.256772,89.0157199 232.627731,89.0157199 L232.627731,89.0157199 L232.627731,89.0157199 Z M198.63015,164.891378 C198.556532,155.367859 198.68571,145.915172 198.669042,136.341653 C200.213629,137.386088 201.937399,138.422189 203.583385,139.295791 C204.464021,139.762454 205.266873,140.181894 206.054446,140.579112 C208.242148,141.683268 210.375678,142.63187 212.692559,143.737415 C213.182882,143.970746 213.681539,144.198522 214.128802,144.279077 C214.934432,144.424909 214.934432,143.424918 214.9511,142.405484 C214.9511,138.849962 214.987215,135.749992 214.9511,132.191693 C214.944155,131.280591 214.910819,130.922261 214.191308,130.427821 C212.093892,129.229222 209.995087,128.029233 207.899061,126.829245 C205.529398,125.475091 203.520879,124.097327 201.373458,122.412621 C199.277432,120.77097 197.184183,119.129319 195.088156,117.486279 C193.956107,116.721009 193.225484,117.140449 193.23104,118.591824 C193.242153,122.195956 193.254654,125.802866 193.265766,129.406998 L193.196315,163.031674 C190.315494,160.884473 186.506809,159.573374 182.335591,159.573374 C173.343094,159.573374 166.050755,165.641371 166.050755,173.124632 C166.050755,180.609283 173.343094,186.67728 182.335591,186.67728 C188.376426,186.67728 193.858876,184.071749 196.463283,179.870401 C199.135752,175.557942 198.660708,168.842729 198.63015,164.891378 L198.63015,164.891378 L198.63015,164.891378 Z M155.346989,105.344729 C152.288373,105.344729 149.788143,107.844705 149.788143,110.904398 L149.788143,192.068895 C149.788143,195.127198 152.296708,197.628563 155.346989,197.628563 L225.695147,197.628563 C228.746818,197.628563 231.255383,195.120254 231.255383,192.068895 L231.255383,110.903009 C231.255383,107.85165 228.753763,105.343341 225.695147,105.343341 L155.346989,105.343341 L155.346989,105.344729 L155.346989,105.344729 Z M238.439379,170.526046 C237.460122,170.526046 236.65727,171.327428 236.65727,172.307974 L236.65727,179.582904 C236.65727,180.56345 237.458733,181.364831 238.439379,181.364831 L245.71505,181.364831 C246.694307,181.364831 247.497159,180.56345 247.497159,179.582904 L247.497159,172.307974 C247.497159,171.327428 246.695696,170.526046 245.71505,170.526046 L238.439379,170.526046 L238.439379,170.526046 Z M238.503274,192.216115 C237.522628,192.216115 236.721165,193.017497 236.721165,193.998043 L236.721165,201.272973 C236.721165,202.253519 237.522628,203.0549 238.503274,203.0549 L245.778945,203.0549 C246.759591,203.0549 247.561054,202.253519 247.561054,201.272973 L247.561054,193.998043 C247.561054,193.017497 246.759591,192.216115 245.778945,192.216115 L238.503274,192.216115 L238.503274,192.216115 Z M238.414377,127.134797 C237.43512,127.134797 236.632268,127.936179 236.632268,128.916725 L236.632268,136.191655 C236.632268,137.172201 237.433731,137.973582 238.414377,137.973582 L245.690048,137.973582 C246.669305,137.973582 247.472157,137.172201 247.472157,136.191655 L247.472157,128.916725 C247.472157,127.936179 246.670694,127.134797 245.690048,127.134797 L238.414377,127.134797 L238.414377,127.134797 Z M238.476882,148.824866 C237.496236,148.824866 236.694773,149.626248 236.694773,150.606794 L236.694773,157.881724 C236.694773,158.86227 237.496236,159.663651 238.476882,159.663651 L245.752554,159.663651 C246.731811,159.663651 247.534663,158.86227 247.534663,157.881724 L247.534663,150.606794 C247.534663,149.626248 246.7332,148.824866 245.752554,148.824866 L238.476882,148.824866 L238.476882,148.824866 Z M238.476882,105.382229 C237.496236,105.382229 236.694773,106.18361 236.694773,107.164156 L236.694773,114.439086 C236.694773,115.418244 237.496236,116.221014 238.476882,116.221014 L245.752554,116.221014 C246.731811,116.221014 247.534663,115.419632 247.534663,114.439086 L247.534663,107.164156 C247.534663,106.18361 246.7332,105.382229 245.752554,105.382229 L238.476882,105.382229 L238.476882,105.382229 Z M135.340976,165.035821 C134.361719,165.035821 133.558867,165.837203 133.558867,166.817749 L133.558867,174.092679 C133.558867,175.073225 134.36033,175.874606 135.340976,175.874606 L142.616648,175.874606 C143.597294,175.874606 144.398756,175.073225 144.398756,174.092679 L144.398756,166.817749 C144.398756,165.837203 143.597294,165.035821 142.616648,165.035821 L135.340976,165.035821 L135.340976,165.035821 L135.340976,165.035821 Z M135.403482,186.72589 C134.424225,186.72589 133.621373,187.527272 133.621373,188.507818 L133.621373,195.782748 C133.621373,196.763294 134.422836,197.564675 135.403482,197.564675 L142.679153,197.564675 C143.65841,197.564675 144.461262,196.763294 144.461262,195.782748 L144.461262,188.507818 C144.461262,187.527272 143.659799,186.72589 142.679153,186.72589 L135.403482,186.72589 L135.403482,186.72589 Z M135.314585,121.644572 C134.333939,121.644572 133.532476,122.445954 133.532476,123.4265 L133.532476,130.70143 C133.532476,131.681976 134.333939,132.483357 135.314585,132.483357 L142.590256,132.483357 C143.570902,132.483357 144.372365,131.681976 144.372365,130.70143 L144.372365,123.4265 C144.372365,122.445954 143.570902,121.644572 142.590256,121.644572 L135.314585,121.644572 L135.314585,121.644572 L135.314585,121.644572 Z M135.377091,143.334641 C134.397834,143.334641 133.594982,144.136023 133.594982,145.116569 L133.594982,152.391499 C133.594982,153.372045 134.396445,154.173426 135.377091,154.173426 L142.652762,154.173426 C143.633408,154.173426 144.434871,153.372045 144.434871,152.391499 L144.434871,145.116569 C144.434871,144.136023 143.633408,143.334641 142.652762,143.334641 L135.377091,143.334641 L135.377091,143.334641 Z M135.377091,99.893393 C134.397834,99.893393 133.594982,100.694774 133.594982,101.67532 L133.594982,108.95025 C133.594982,109.929408 134.396445,110.732178 135.377091,110.732178 L142.652762,110.732178 C143.633408,110.732178 144.434871,109.930796 144.434871,108.95025 L144.434871,101.67532 C144.434871,100.694774 143.633408,99.893393 142.652762,99.893393 L135.377091,99.893393 L135.377091,99.893393 Z"></path></g></g></g></g></svg>',
	'movie':'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="94px" height="94px" viewBox="0 0 94 94" version="1.1" class="replaced-svg"><title>Movie icon</title><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" type="MSPage"><g type="MSArtboardGroup" transform="translate(-525.000000, -402.000000)" fill="#97B3C5"><g type="MSLayerGroup" transform="translate(430.000000, 329.000000)"><g type="MSShapeGroup"><path d="M172.987284,73.6303463 L174.953934,73.6303463 C176.088064,73.6303463 175.964115,73.5394599 175.964115,74.672441 L175.964115,76.4065113 C175.964115,77.134635 176.560101,77.7315931 177.289332,77.7315931 L182.699687,77.7315931 C183.427885,77.7315931 184.024904,77.1356678 184.024904,76.4065113 L184.024904,74.4101099 C184.024904,73.5797391 183.916449,73.6313791 184.753102,73.6313791 L187.378745,73.6313791 C188.235023,73.6313791 188.132766,73.5745751 188.132766,74.4276675 L188.132766,164.171747 C188.132766,166.957207 188.232958,166.548218 185.461674,166.548218 L182.749266,166.548218 L182.718279,166.548218 L177.307924,166.548218 L177.273838,166.548218 L174.373442,166.548218 C171.921326,166.548218 171.964708,166.94378 171.964708,164.474357 C171.964708,164.312207 171.950247,164.156255 171.917194,164.01063 L171.917194,162.429414 C171.917194,160.209928 170.101348,158.394266 167.881635,158.394266 L115.421436,158.394266 C113.201724,158.394266 111.385877,160.209928 111.385877,162.429414 L111.385877,165.08061 L111.385877,166.101016 C111.340429,166.592629 111.095631,166.547185 110.005916,166.547185 L108.6807,166.547185 C107.172659,166.547185 107.378207,166.619481 107.378207,165.117791 L107.378207,163.789611 C107.378207,163.060454 106.782221,162.464529 106.05299,162.464529 L100.642635,162.464529 C99.914437,162.464529 99.317418,163.060454 99.317418,163.789611 L99.317418,164.701573 C99.317418,166.306543 99.7316128,166.547185 98.0851627,166.547185 L96.6845438,166.547185 C94.8005256,166.547185 95.2219507,166.395364 95.2281481,164.546653 C95.3562283,135.127359 95.2198849,105.101812 95.2178191,75.7135029 C95.2178191,73.3545888 95.0690808,73.6303463 97.4375314,73.6303463 L100.404034,73.6303463 C100.47737,73.6427399 100.548641,73.6489367 100.624043,73.6489367 L106.034398,73.6489367 C106.1098,73.6489367 106.186235,73.6437727 106.259571,73.6303463 L109.471905,73.6303463 C111.028492,73.6303463 111.335265,73.5301647 111.385877,74.3047644 L111.385877,75.5823373 L111.385877,77.6603299 C111.385877,79.879816 113.201724,81.6954775 115.421436,81.6954775 L167.883701,81.6954775 C170.103413,81.6954775 171.91926,79.879816 171.91926,77.6603299 L171.91926,75.1093152 C171.95128,74.9151489 171.966774,74.708589 171.966774,74.4824059 C171.965741,73.4527048 171.967807,73.6303463 172.987284,73.6303463 L172.987284,73.6303463 L172.987284,73.6303463 Z M111.385877,89.9072663 L111.385877,150.263036 C111.385877,152.53726 113.251303,154.397332 115.519562,154.397332 L167.832056,154.397332 C170.101348,154.397332 171.966774,152.532096 171.966774,150.263036 L171.966774,89.9062335 C171.966774,87.637173 170.106512,85.7719371 167.832056,85.7719371 L115.519562,85.7719371 C113.245106,85.7729699 111.385877,87.632009 111.385877,89.9072663 Z M177.308957,134.243283 C176.580759,134.243283 175.98374,134.839208 175.98374,135.568365 L175.98374,140.978168 C175.98374,141.707325 176.579726,142.30325 177.308957,142.30325 L182.719312,142.30325 C183.44751,142.30325 184.044529,141.707325 184.044529,140.978168 L184.044529,135.568365 C184.044529,134.839208 183.448543,134.243283 182.719312,134.243283 L177.308957,134.243283 L177.308957,134.243283 Z M177.356471,150.372513 C176.62724,150.372513 176.031254,150.968438 176.031254,151.697594 L176.031254,157.107398 C176.031254,157.836555 176.62724,158.43248 177.356471,158.43248 L182.766826,158.43248 C183.496056,158.43248 184.092043,157.836555 184.092043,157.107398 L184.092043,151.697594 C184.092043,150.968438 183.496056,150.372513 182.766826,150.372513 L177.356471,150.372513 L177.356471,150.372513 Z M177.290365,101.976561 C176.562167,101.976561 175.965148,102.572486 175.965148,103.301643 L175.965148,108.711447 C175.965148,109.440603 176.561134,110.036528 177.290365,110.036528 L182.70072,110.036528 C183.428918,110.036528 184.025937,109.440603 184.025937,108.711447 L184.025937,103.301643 C184.025937,102.572486 183.429951,101.976561 182.70072,101.976561 L177.290365,101.976561 L177.290365,101.976561 Z M177.336845,118.105791 C176.607615,118.105791 176.011629,118.701716 176.011629,119.430873 L176.011629,124.840676 C176.011629,125.569833 176.607615,126.165758 177.336845,126.165758 L182.747201,126.165758 C183.475398,126.165758 184.072417,125.569833 184.072417,124.840676 L184.072417,119.430873 C184.072417,118.701716 183.476431,118.105791 182.747201,118.105791 L177.336845,118.105791 L177.336845,118.105791 Z M177.336845,85.8008555 C176.607615,85.8008555 176.011629,86.3967808 176.011629,87.1259373 L176.011629,92.535741 C176.011629,93.2638646 176.607615,93.8608228 177.336845,93.8608228 L182.747201,93.8608228 C183.475398,93.8608228 184.072417,93.2648974 184.072417,92.535741 L184.072417,87.1259373 C184.072417,86.3967808 183.476431,85.8008555 182.747201,85.8008555 L177.336845,85.8008555 L177.336845,85.8008555 Z M100.642635,130.160627 C99.914437,130.160627 99.317418,130.756552 99.317418,131.485708 L99.317418,136.895512 C99.317418,137.624668 99.9134041,138.220594 100.642635,138.220594 L106.05299,138.220594 C106.782221,138.220594 107.378207,137.624668 107.378207,136.895512 L107.378207,131.485708 C107.378207,130.756552 106.782221,130.160627 106.05299,130.160627 L100.642635,130.160627 L100.642635,130.160627 L100.642635,130.160627 Z M100.689116,146.289856 C99.9609177,146.289856 99.3638988,146.885782 99.3638988,147.614938 L99.3638988,153.024742 C99.3638988,153.753898 99.9598848,154.349823 100.689116,154.349823 L106.099471,154.349823 C106.827668,154.349823 107.424687,153.753898 107.424687,153.024742 L107.424687,147.614938 C107.424687,146.885782 106.828701,146.289856 106.099471,146.289856 L100.689116,146.289856 L100.689116,146.289856 Z M100.62301,97.8939048 C99.8937789,97.8939048 99.2977929,98.4898301 99.2977929,99.2189865 L99.2977929,104.62879 C99.2977929,105.357947 99.8937789,105.953872 100.62301,105.953872 L106.033365,105.953872 C106.762595,105.953872 107.358582,105.357947 107.358582,104.62879 L107.358582,99.2189865 C107.358582,98.4898301 106.762595,97.8939048 106.033365,97.8939048 L100.62301,97.8939048 L100.62301,97.8939048 L100.62301,97.8939048 Z M100.66949,114.023134 C99.9412925,114.023134 99.3442736,114.61906 99.3442736,115.348216 L99.3442736,120.75802 C99.3442736,121.487176 99.9402596,122.083102 100.66949,122.083102 L106.079845,122.083102 C106.809076,122.083102 107.405062,121.487176 107.405062,120.75802 L107.405062,115.348216 C107.405062,114.61906 106.809076,114.023134 106.079845,114.023134 L100.66949,114.023134 L100.66949,114.023134 Z M100.66949,81.7192319 C99.9412925,81.7192319 99.3442736,82.3151572 99.3442736,83.0443137 L99.3442736,88.4541174 C99.3442736,89.1822411 99.9402596,89.7791992 100.66949,89.7791992 L106.079845,89.7791992 C106.809076,89.7791992 107.405062,89.1832739 107.405062,88.4541174 L107.405062,83.0443137 C107.405062,82.3151572 106.809076,81.7192319 106.079845,81.7192319 L100.66949,81.7192319 L100.66949,81.7192319 Z"></path></g></g></g></g></svg>',
	'video':'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40px" height="30px" viewBox="0 0 40 30" version="1.1" class="entity-image replaced-svg"><title>Video icon</title><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" type="MSPage"><g type="MSArtboardGroup" transform="translate(-18.000000, -23.000000)" fill="#979797"><g type="MSLayerGroup" transform="translate(6.000000, 6.000000)"><path d="M43.7629474,47 L20.2370526,47 C15.6951579,47 12,43.291831 12,38.7339437 L12,25.2660563 C12,20.708169 15.6951579,17 20.2370526,17 L43.7629474,17 C48.3048421,17 52,20.708169 52,25.2660563 L52,38.7339437 C52,43.291831 48.3048421,47 43.7629474,47 L43.7629474,47 Z M20.2370526,19.1126761 C16.856,19.1126761 14.1052632,21.8730986 14.1052632,25.2660563 L14.1052632,38.7339437 C14.1052632,42.1269014 16.856,44.8873239 20.2370526,44.8873239 L43.7629474,44.8873239 C47.144,44.8873239 49.8947368,42.1269014 49.8947368,38.7339437 L49.8947368,25.2660563 C49.8947368,21.8730986 47.144,19.1126761 43.7629474,19.1126761 L20.2370526,19.1126761 L20.2370526,19.1126761 Z M27.3684211,39.3726056 L27.3684211,25.4234507 L40.9632632,32.3979225 L27.3684211,39.3726056 Z" type="MSShapeGroup"></path></g></g></g></svg>',
	'music':'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="67px" height="94px" viewBox="0 0 67 94" version="1.1" class="entity-image replaced-svg"><title>Music icon</title><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" type="MSPage"><g type="MSArtboardGroup" transform="translate(-1141.000000, -402.000000)" fill="#979DC4"><g type="MSLayerGroup" transform="translate(430.000000, 329.000000)"><g transform="translate(602.334463, 0.000000)" type="MSShapeGroup"><path d="M152.896234,137.462018 C152.79775,124.737055 152.970561,112.106737 152.948263,99.3149671 C155.014562,100.7105 157.320567,102.094899 159.522514,103.262174 C160.700602,103.88571 161.774632,104.44615 162.828222,104.976898 C165.75486,106.452229 168.609029,107.719715 171.708479,109.196902 C172.364417,109.50867 173.031505,109.813015 173.62984,109.920649 C174.707586,110.115504 174.707586,108.779355 174.729884,107.417225 C174.729884,102.666474 174.778197,98.5244123 174.729884,93.7699492 C174.720593,92.5525691 174.675997,92.0737824 173.713458,91.4131311 C170.907602,89.8116082 168.099887,88.2082295 165.295889,86.6048508 C162.125829,84.7954826 159.438896,82.9545663 156.566145,80.7035266 C153.762147,78.5100155 150.961865,76.3165044 148.157867,74.1211376 C146.643448,73.0986125 145.666043,73.6590528 145.673476,75.5983244 C145.688342,80.4140277 145.705065,85.2334425 145.719931,90.0491457 L145.627022,134.977152 C141.77315,132.108143 136.678012,130.356304 131.097888,130.356304 C119.068012,130.356304 109.312551,138.464129 109.312551,148.462977 C109.312551,158.46368 119.068012,166.571506 131.097888,166.571506 C139.179126,166.571506 146.513375,163.090096 149.997468,157.476415 C153.572612,151.714273 152.937114,142.741662 152.896234,137.462018 L152.896234,137.462018 L152.896234,137.462018 Z"></path></g></g></g></g></svg>',
	'podcast':'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="59.75px" height="61.75px" viewBox="17.25 0 59.75 61.75" enable-background="new 17.25 0 59.75 61.75" xml:space="preserve" class="replaced-svg"><title>Podcast icon</title><path d="M37.365,36.114c-2.199-2.432-3.41-5.578-3.41-8.857c0-4.215,1.942-8.08,5.329-10.602c0.921-0.687,1.112-1.99,0.426-2.911  c-0.687-0.921-1.99-1.112-2.911-0.426c-4.386,3.267-7.004,8.478-7.004,13.939c0,4.313,1.592,8.449,4.483,11.647  c0.411,0.454,0.977,0.686,1.544,0.686c0.498,0,0.996-0.177,1.395-0.537C38.07,38.281,38.136,36.967,37.365,36.114z"></path><path d="M64.539,27.257c0-5.462-2.619-10.673-7.006-13.939c-0.922-0.686-2.225-0.495-2.911,0.426  c-0.687,0.921-0.495,2.225,0.427,2.911c3.387,2.522,5.328,6.386,5.328,10.602c0,3.28-1.211,6.425-3.41,8.857  c-0.77,0.853-0.703,2.168,0.148,2.938c0.398,0.36,0.897,0.537,1.395,0.537c0.567,0,1.133-0.231,1.543-0.686  C62.945,35.707,64.539,31.57,64.539,27.257z"></path><path d="M59.497,1.238c-1.038-0.492-2.279-0.05-2.772,0.988c-0.492,1.038-0.05,2.279,0.988,2.772  c8.555,4.061,14.082,12.798,14.082,22.26c0,8.228-4.086,15.879-10.932,20.47c-0.953,0.64-1.209,1.932-0.568,2.887  c0.401,0.599,1.059,0.922,1.729,0.922c0.398,0,0.801-0.114,1.156-0.353c7.999-5.363,12.775-14.308,12.775-23.925  C75.956,16.198,69.496,5.984,59.497,1.238z"></path><path d="M33.47,47.727c-6.845-4.59-10.932-12.242-10.932-20.47c0-9.461,5.528-18.199,14.083-22.26  c1.038-0.493,1.48-1.733,0.987-2.772c-0.492-1.038-1.733-1.48-2.771-0.987c-9.999,4.747-16.459,14.96-16.459,26.02  c0,9.617,4.776,18.561,12.775,23.926c0.355,0.238,0.758,0.352,1.157,0.352c0.67,0,1.328-0.323,1.729-0.922  C34.679,49.659,34.424,48.367,33.47,47.727z"></path><path d="M49.331,34.621c3.185-0.935,5.511-3.876,5.511-7.363c0-4.238-3.437-7.675-7.676-7.675c-4.238,0-7.673,3.437-7.673,7.674  c0,3.487,2.326,6.428,5.51,7.363l-2.771,9.323L37.295,60.63h9.871h9.871l-4.936-16.686L49.331,34.621z"></path></svg>',
	'book':'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="38px" height="33px" viewBox="0 0 38 33" version="1.1" class="replaced-svg"><title>Books icon</title><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" type="MSPage"><g type="MSArtboardGroup" transform="translate(-19.000000, -22.000000)" fill="#979797"><path d="M56.9756309,53.1283177 L56.9756309,27.5608116 C56.9802413,27.5334278 56.978924,26.8271818 56.1569609,25.9591807 C53.737175,23.5213902 50.4302223,22 46.7801262,22 C43.3888695,22 40.2933351,23.3163305 37.9321669,25.4579944 C35.5683641,23.3150568 32.4708539,22 29.0789386,22 C25.4123769,22 22.0876412,23.5354004 19.6645623,25.9916591 C19.2792671,26.2648597 18.9980345,26.7150995 19.0000103,27.2436696 L19.0000103,53.036614 C19.0019862,53.1512436 19.0224036,53.2346685 19.0368933,53.2881623 C19.0316243,53.3403825 19.0289898,53.39515 19.0289898,53.4486439 C19.0276726,53.7868013 19.1449077,54.150432 19.4221885,54.42618 C19.6836624,54.6936492 20.0393195,54.8369363 20.3962939,54.8356626 C20.7664408,54.8369363 21.1332946,54.6828231 21.3987202,54.4000699 C21.4224307,54.3726862 21.4678757,54.3332026 21.5284692,54.2758878 C21.6417526,54.1886419 21.7458152,54.0892962 21.8340709,53.9772139 C23.7539608,52.1399554 26.2824196,51.0172217 29.0789386,51.015948 C32.1580073,51.0172217 34.9255468,52.36412 36.8928577,54.5459043 C37.1576246,54.8433046 37.5363336,55.0025124 37.9130668,54.9999651 C38.2601618,55.0025124 38.6098913,54.8655937 38.8726824,54.6108611 C38.9010033,54.58093 38.9220792,54.55482 38.9385449,54.5325309 C38.9820141,54.5051471 39.0386558,54.4643899 39.1032009,54.3981594 C41.0599738,52.3048947 43.7715302,51.0172217 46.7807848,51.015948 C49.666218,51.0172217 52.2664669,52.2074595 54.2028224,54.1517057 C54.2337778,54.1911892 54.2943712,54.2535987 54.364844,54.3121872 C54.4372927,54.3905175 54.531476,54.4739424 54.5966798,54.5459043 C54.8614468,54.8433046 55.2394972,55.0025124 55.6162303,54.9999651 L55.6247924,54.9999651 C55.9692529,54.9999651 56.3143721,54.86432 56.5745287,54.6108611 C56.8630061,54.3312921 57,53.9606563 57,53.5944782 C57,53.4785749 56.9835344,53.3741346 56.9598239,53.2760626 C56.9644343,53.244221 56.9723378,53.1964586 56.9756309,53.1283177 L56.9756309,53.1283177 Z M49.5555691,48.5011009 C48.6591814,48.3055937 47.7311797,48.202427 46.7801262,48.202427 C44.1080873,48.202427 41.6198045,49.022029 39.5280136,50.4141423 L39.5280136,27.7786079 C39.771046,27.5455276 40.0239578,27.3245471 40.2860902,27.1150296 C42.0907209,25.6700592 44.3339954,24.8128842 46.7794676,24.8128842 C49.4653376,24.8128842 52.1202523,26.135583 54.0105041,27.8448384 L54.0105041,50.5395981 C52.7242108,49.7250908 51.0796258,48.8348005 49.5555691,48.5011009 L49.5555691,48.5011009 Z M33.8348649,49.1060907 C33.8243269,49.100996 33.811813,49.0984487 33.8006164,49.0933541 C32.3312255,48.5202058 30.7399891,48.2030638 29.0782799,48.2030638 C27.5061436,48.2030638 25.9939422,48.4839064 24.5897551,48.999103 C23.9713068,49.2264518 23.3759104,49.5028366 22.8022486,49.8161577 C22.5908302,49.932061 22.1561382,50.3670168 21.9519646,50.4937463 L21.9519646,27.7696923 C22.3359426,27.4315348 22.9715151,26.8106242 23.3969864,26.5304184 C25.0468404,25.4458946 26.986489,24.8128842 29.0782799,24.8128842 C31.88863,24.8128842 34.4296027,25.9458072 36.3501512,27.8015338 L36.3501512,50.4224212 C35.6408128,49.9486186 34.8814189,49.5480517 34.0877766,49.2156257 C34.0041313,49.1806 33.9218033,49.1404796 33.8348649,49.1060907 L33.8348649,49.1060907 Z" type="MSShapeGroup"></path></g></g></svg>',
	'recipe':'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="91.102px" height="74.613px" viewBox="0.459 0.687 91.102 74.613" enable-background="new 0.459 0.687 91.102 74.613" xml:space="preserve" class="replaced-svg"><title>Recipes icon</title><g type="MSPage"><g type="MSLayerGroup"><g type="MSShapeGroup"><path d="M89.3,65.3v-17v-0.2V48c0-0.2-0.1-0.4-0.2-0.5v-0.1C89,47.2,88.9,47.1,88.8,47l0,0L70.9,28.7     c-0.2,1.7-0.601,3-1.5,4.2l12,12.3l-66-12.5c1.8-1.6,4.6-3,7.5-3.2c5.3-0.4,11.1-2,15.8-3.9c0-0.5,0-1,0.1-1.4     c0.2-1.6,0.9-2.9,1.9-3.9C36.3,22.6,29,25,22.6,25.5c-5.9,0.4-10.9,4.2-12.7,7.6v0.1c0,0.1-0.1,0.2-0.1,0.3v0.1v0.3V34l0,0     c0,0.6,0.3,15,1.4,19.3c0.8,2.9,6.6,5,59.7,12.601C78.5,67,85.8,68,86.7,68.3c0.3,0.101,1.1,0.4,0.899,1.5     c-0.1,0.7-0.6,1.5-1.399,1.5c-3,0-56.3-8-72.3-10.899C6.3,59,5.7,50.7,5.7,42.9c0-4.601-0.2-7.7-0.5-8.8c-0.9-3-0.9-5.2-0.2-6.5     c0.8-1.4,2.7-1.9,4.7-2.4s4-1,5.2-2.7c3-4.2,5.4-4.1,8.4-3.9c2.7,0.1,6,0.2,8.9-3.1c3.5-4,6-3.5,8.6-2.9c1.9,0.4,4.2,0.9,6.3-0.8     C48.7,10.6,50.2,9,50.8,5c-2.2,0.7-4.2,2.1-6.1,3.6c-0.6,0.5-1.3,0.4-3.1,0.1c-2.9-0.6-7.3-1.5-12.4,4.2     c-1.7,1.9-3.3,1.9-5.8,1.8c-3.4-0.1-7.6-0.3-11.8,5.6c-0.3,0.4-1.8,0.8-2.9,1.1c-2.5,0.6-5.6,1.4-7.2,4.3     c-1.3,2.3-1.4,5.5-0.2,9.6l0,0c0,0.2,0.4,1.7,0.4,7.601c0,6.3,0,19.399,11.5,21.399c14,2.5,69.1,11,73,11c2.6,0,4.899-2,5.3-4.8     C91.8,68.4,91,66.5,89.3,65.3L89.3,65.3z M85.3,64.1c-2.5-0.399-6.7-1-13.899-2.1c-17-2.4-51.9-7.5-56.5-10.1     c-0.6-3.101-1-10.7-1.1-15.4L85.3,50V64.1L85.3,64.1z"></path><path d="M71,26.2c-0.1-3.5-2.2-6.4-3.5-7.8C70.1,8.7,54.6,1.2,53.9,0.9C53.3,0.6,52.6,0.6,52,1s-0.9,1-1,1.7     c0,0.9-0.1,1.7-0.2,2.5c-0.5,4-2.1,5.6-3.7,6.8c-0.3,0.2-0.6,0.4-0.8,0.6c-2.1,1.5-3.8,3-3.2,6.3c-0.9,0.4-1.7,0.9-2.4,1.6     c-1,1-1.7,2.3-1.9,3.9c-0.1,0.5-0.1,1-0.1,1.4c0,2.8,1.4,5.5,3.6,7c2.4,1.6,8.9,4,15.4,4c1.3,0,2.5-0.1,3.8-0.3     c4.1-0.7,6.5-1.8,7.8-3.4c0.9-1.1,1.4-2.5,1.5-4.2C71,27.9,71,27.1,71,26.2L71,26.2z M67,26.3c0,1.6,0.1,2.8-0.4,3.7     C66,31.1,64.4,31.8,61,32.4c-6.2,1-13.9-1.4-16.4-3.1c-1.3-0.8-2-2.7-1.7-4.4c0.1-0.6,0.3-1,0.6-1.4c0.4-0.5,0.9-0.9,1.6-1.1h0.1     l0,0l0.2,0.2c0.8,0.8,2.1,2.1,5.5,3.1c1.1,0.3,2.199-0.3,2.5-1.4c0.3-1.1-0.301-2.2-1.4-2.5c-1.6-0.4-2.4-0.9-3-1.4     c-0.3-0.2-0.5-0.5-0.8-0.7c-0.2-0.2-0.4-0.4-0.7-0.6c-0.5-1.3-0.6-1.9,0.1-2.4c0.301-0.3,0.601-0.5,1.2-0.9     c1.8-1.2,4.2-2.9,5.5-6.9C54.6,8,54.8,7.1,55,6c1.6,0.9,3.6,2.3,5.3,3.9c2.5,2.3,4.4,5.1,3.5,7.9c-0.8,0.5-1.899,0.7-2.7,0.7     h-0.6c-1.1-0.1-2.1,0.6-2.2,1.7c-0.1,1.1,0.601,2.1,1.7,2.2c0.1,0,0.5,0.1,1.1,0.1c0.9,0,2.101-0.1,3.4-0.6     c0.2-0.1,0.5-0.2,0.7-0.3c0.5,0.7,1.2,1.6,1.6,2.7C66.8,24.9,67,25.6,67,26.3L67,26.3z"></path></g></g></g></svg>',
	'thing':'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="34px" height="35px" viewBox="0 0 34 35" version="1.1" class="replaced-svg"><title>Things icon</title><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" type="MSPage"><g type="MSArtboardGroup" transform="translate(-21.000000, -21.000000)" fill="#979797"><g type="MSLayerGroup" transform="translate(6.000000, 6.000000)"><path d="M48.1914284,27.1380632 C48.1914284,27.1009364 48.1543015,27.0638095 48.1543015,27.0266826 C48.1543015,26.9895557 48.1171747,26.9524288 48.1171747,26.915302 C48.1171747,26.8781751 48.0800478,26.8410482 48.0429209,26.8039213 C48.0429209,26.7667945 48.005794,26.7296676 48.005794,26.7296676 C47.9686672,26.6554138 47.9315403,26.6182869 47.8572865,26.5440332 L37.6845221,16.3712688 C37.6473952,16.3341419 37.5731415,16.2598881 37.4988877,16.2227613 C37.4617608,16.2227613 37.4617608,16.1856344 37.424634,16.1856344 C37.3875071,16.1485075 37.3503802,16.1485075 37.3132533,16.1113806 C37.2761265,16.1113806 37.2389996,16.0742538 37.2018727,16.0742538 C37.1647458,16.0742538 37.127619,16.0371269 37.0904921,16.0371269 C37.0162383,16.0371269 36.9419846,16 36.8677308,16 L16.0766794,16 L16.0766794,16 L15.9652988,16 L15.8539182,16 L15.8167913,16 C15.7425375,16.0742538 15.7054107,16.1113806 15.6682838,16.1113806 L15.6682838,16.1113806 C15.59403,16.1485075 15.5197763,16.1856344 15.4455225,16.2227613 L15.4083957,16.2598881 L15.297015,16.3712688 L15.297015,16.3712688 C15.2598881,16.4083957 15.2598881,16.4083957 15.2227613,16.4455225 C15.2227613,16.4826494 15.1856344,16.4826494 15.1485075,16.5197763 C15.1485075,16.5569032 15.1113806,16.59403 15.1113806,16.6311569 C15.1113806,16.6682838 15.0742538,16.7054107 15.0742538,16.7425375 C15.0371269,16.7796644 15.0371269,16.8167913 15.0371269,16.8539182 C15.0371269,16.8910451 15,16.9281719 15,16.9652988 L15,17.1138063 L15,17.1880601 L15,37.6449695 L15,37.6449695 L15,37.7934771 L15,37.8677308 C15,37.9048577 15.0371269,37.9419846 15.0371269,37.9791114 C15.0371269,38.0162383 15.0371269,38.0533652 15.0742538,38.0533652 L15.1113806,38.0904921 C15.1485075,38.127619 15.1485075,38.2018727 15.1856344,38.2389996 L15.2227613,38.2761265 C15.2598881,38.3132533 15.297015,38.3503802 15.3341419,38.3875071 L15.3341419,38.3875071 L25.915302,48.5973984 C25.9524288,48.5973984 25.9524288,48.6345253 25.9895557,48.6345253 C26.0266826,48.6716521 26.0638095,48.708779 26.1009364,48.708779 C26.1380632,48.7459059 26.1751901,48.7459059 26.212317,48.7459059 C26.2494439,48.7459059 26.2865707,48.7830328 26.3236976,48.7830328 C26.3608245,48.7830328 26.3979514,48.8201597 26.4350783,48.8201597 C26.4722051,48.8201597 26.509332,48.8572865 26.509332,48.8572865 C26.5835858,48.8572865 26.6578395,48.8944134 26.7320933,48.8944134 L26.7320933,48.8944134 L47.1890027,48.8944134 C47.2632565,48.8944134 47.3375102,48.8944134 47.411764,48.8572865 C47.4488909,48.8572865 47.4860178,48.8201597 47.5231446,48.8201597 C47.5602715,48.8201597 47.5973984,48.7830328 47.6345253,48.7830328 C47.6716521,48.7830328 47.708779,48.7459059 47.7459059,48.708779 C47.6716521,48.7459059 47.708779,48.7459059 47.708779,48.7459059 C47.8201597,48.6716521 47.9315403,48.5602715 48.005794,48.4488909 C48.005794,48.411764 48.0429209,48.411764 48.0429209,48.3746371 C48.0800478,48.3375102 48.0800478,48.3003834 48.1171747,48.2632565 C48.1171747,48.2261296 48.1543015,48.1890027 48.1543015,48.1518759 C48.1543015,48.114749 48.1914284,48.0776221 48.1914284,48.0404952 C48.1914284,47.9662415 48.2285553,47.8919877 48.2285553,47.817734 L48.2285553,27.3608245 C48.2285553,27.2865707 48.2285553,27.212317 48.1914284,27.1380632 L48.1914284,27.1380632 Z M38.018664,19.8240684 L44.4416138,26.2470182 L38.018664,26.2470182 L38.018664,19.8240684 L38.018664,19.8240684 Z M25.5440332,45.1817257 L18.8611953,38.6845221 L25.5811601,38.6845221 L25.5811601,45.1817257 L25.5440332,45.1817257 Z M25.5440332,36.4569095 L17.1904858,36.4569095 L17.1904858,19.7869415 L25.5440332,27.8434739 L25.5440332,36.4569095 L25.5440332,36.4569095 Z M18.8611953,18.2647395 L35.7910514,18.2647395 L35.7910514,26.2470182 L27.103362,26.2470182 L18.8611953,18.2647395 L18.8611953,18.2647395 Z M35.7910514,28.4746308 L35.7910514,36.4569095 L27.7716458,36.4569095 L27.7716458,28.4746308 L35.7910514,28.4746308 L35.7910514,28.4746308 Z M27.7716458,46.7039276 L27.7716458,38.6845221 L36.4222083,38.6845221 L44.4044869,46.6668008 L27.7716458,46.6668008 L27.7716458,46.7039276 Z M46.0009427,45.1074719 L38.018664,37.1251933 L38.018664,28.4746308 L46.0009427,28.4746308 L46.0009427,45.1074719 L46.0009427,45.1074719 Z" type="MSShapeGroup" transform="translate(31.614278, 32.447207) rotate(-270.000000) translate(-31.614278, -32.447207) "></path></g></g></g></svg>',
	'song':'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="67px" height="94px" viewBox="0 0 67 94" version="1.1" class="entity-image replaced-svg"><title>Music icon</title><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" type="MSPage"><g type="MSArtboardGroup" transform="translate(-1141.000000, -402.000000)" fill="#979DC4"><g type="MSLayerGroup" transform="translate(430.000000, 329.000000)"><g transform="translate(602.334463, 0.000000)" type="MSShapeGroup"><path d="M152.896234,137.462018 C152.79775,124.737055 152.970561,112.106737 152.948263,99.3149671 C155.014562,100.7105 157.320567,102.094899 159.522514,103.262174 C160.700602,103.88571 161.774632,104.44615 162.828222,104.976898 C165.75486,106.452229 168.609029,107.719715 171.708479,109.196902 C172.364417,109.50867 173.031505,109.813015 173.62984,109.920649 C174.707586,110.115504 174.707586,108.779355 174.729884,107.417225 C174.729884,102.666474 174.778197,98.5244123 174.729884,93.7699492 C174.720593,92.5525691 174.675997,92.0737824 173.713458,91.4131311 C170.907602,89.8116082 168.099887,88.2082295 165.295889,86.6048508 C162.125829,84.7954826 159.438896,82.9545663 156.566145,80.7035266 C153.762147,78.5100155 150.961865,76.3165044 148.157867,74.1211376 C146.643448,73.0986125 145.666043,73.6590528 145.673476,75.5983244 C145.688342,80.4140277 145.705065,85.2334425 145.719931,90.0491457 L145.627022,134.977152 C141.77315,132.108143 136.678012,130.356304 131.097888,130.356304 C119.068012,130.356304 109.312551,138.464129 109.312551,148.462977 C109.312551,158.46368 119.068012,166.571506 131.097888,166.571506 C139.179126,166.571506 146.513375,163.090096 149.997468,157.476415 C153.572612,151.714273 152.937114,142.741662 152.896234,137.462018 L152.896234,137.462018 L152.896234,137.462018 Z"></path></g></g></g></g></svg>',
};

var publisherIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="69px" height="66px" viewBox="0 0 69 66" version="1.1" class="publisher-image replaced-svg"><title>Publishers icon</title><path d="M36.65,10.1 C24.2344595,10.1 14.15,20.1844595 14.15,32.6 C14.15,45.0155405 24.2344595,55.1 36.65,55.1 C49.0655405,55.1 59.15,45.0155405 59.15,32.6 C59.15,20.1844595 49.0655405,10.1 36.65,10.1 L36.65,10.1 Z M53.1195946,43.85 L48.1027027,42.6844595 C47.5959459,42.5831081 47.0385135,42.4310811 46.4304054,42.3297297 C43.3898649,41.6709459 41.5655405,41.2148649 41.2108108,40.4547297 C41.0587838,40.1 41.1601351,39.5425676 41.5148649,38.8837838 C45.0114865,32.2959459 45.5689189,27.2790541 43.2885135,23.4783784 C42.1736486,21.6033784 40.4,20.2858108 38.1702703,19.6777027 C37.6635135,19.5763514 37.1567568,19.5256757 36.65,19.5256757 C35.8898649,19.5256757 35.0790541,19.6777027 34.3189189,19.9310811 C34.1162162,19.9817568 33.6094595,20.2351351 33.5587838,20.2351351 C32.0385135,20.9445946 30.8222973,22.0594595 29.9608108,23.4783784 C27.6804054,27.2790541 28.2378378,32.3466216 31.6837838,38.8837838 C32.0385135,39.5932432 32.1398649,40.1 31.9878378,40.4547297 C31.6331081,41.2148649 29.8087838,41.6709459 26.7682432,42.3297297 C26.2108108,42.4310811 20.0790541,43.85 20.0790541,43.85 L20.0283784,43.697973 C17.8493243,40.4040541 16.6837838,36.6033784 16.6837838,32.6 C16.6837838,21.4006757 25.4506757,12.6337838 36.65,12.6337838 C47.6466216,12.6337838 56.6162162,21.6033784 56.6162162,32.6 C56.6162162,36.5527027 55.4506757,40.4040541 53.2209459,43.697973 L53.1195946,43.85 Z"></path><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" type="MSPage"><g type="MSLayerGroup" transform="translate(1.000000, 0.000000)"><path d="M68,5.01886225 L68,32.4000015 L68,59.1510468 C68,62.7000008 67.5513694,65.3000031 63.5702951,65.3000031 C59.5892208,65.3000031 7.83929265,65.3 7.83929265,65.3 C6.41728877,65.3 5.3,64.2 5.3,62.7 L5.3,58.6 L7.83929265,58.6 C10.0738702,58.6 11.9880155,57 11.9880155,55 C11.9880155,53 10.1754419,51.4 7.83929265,51.4 L5.3,51.4 L5.3,47.3 L7.83929265,47.3 C10.0738702,47.3 11.9880155,45.7 11.9880155,43.7 C11.9880155,41.7 10.1754419,40.1 7.83929265,40.1 L5.3,40.1 L5.3,36 L7.83929265,36 C10.0738702,36 11.9880155,34.4 11.9880155,32.4 C11.9880155,30.4 10.1754419,28.8 7.83929265,28.8 L5.3,28.8 L5.3,25 L7.83929265,25 C10.0738702,25 11.9880155,23.4 11.9880155,21.4 C11.9880155,19.4 10.1754419,17.8 7.83929265,17.8 L5.3,17.8 L5.3,13.7 L7.83929265,13.7 C10.0738702,13.7 11.9880155,12.1 11.9880155,10.1 C11.9880155,8.1 10.1754419,6.5 7.83929265,6.5 L5.3,6.5 L5.3,2.5 C5.3,1.1 7.41728877,3.55271368e-15 8.83929265,3.55271368e-15 C8.83929265,3.55271368e-15 57.5552371,3.63194552e-10 62.7776186,3.55271368e-15 C68,-3.63187452e-10 68,2.50000011 68,5.01886225 Z" stroke="#484848" type="MSShapeGroup"></path><path d="M2.6,12.2 L5.2,12.2 L7.7,12.2 C9.1,12.2 10.2,11.3 10.2,10.2 C10.2,9.1 9.1,8.2 7.7,8.2 L5.2,8.2 L2.6,8.2 C1.2,8.2 0,9.1 0,10.2 C-1.77635684e-15,11.3 1.2,12.2 2.6,12.2 L2.6,12.2 Z M7.7,19.4 L5.2,19.4 L2.6,19.4 C1.2,19.4 0,20.3 0,21.4 C0,22.5 1.1,23.4 2.6,23.4 L5.2,23.4 L7.7,23.4 C9.1,23.4 10.2,22.5 10.2,21.4 C10.2,20.3 9.1,19.4 7.7,19.4 L7.7,19.4 Z M5.2,30.6 L2.6,30.6 C1.2,30.6 0,31.5 0,32.6 C0,33.7 1.1,34.6 2.6,34.6 L5.2,34.6 L7.7,34.6 C9.1,34.6 10.2,33.7 10.2,32.6 C10.2,31.5 9.1,30.6 7.7,30.6 L5.2,30.6 Z M7.7,41.8 L5.2,41.8 L2.6,41.8 C1.2,41.8 0,42.7 0,43.8 C0,44.9 1.1,45.8 2.6,45.8 L5.2,45.8 L7.7,45.8 C9.1,45.8 10.2,44.9 10.2,43.8 C10.2,42.7 9.1,41.8 7.7,41.8 L7.7,41.8 Z M7.7,53 L5.2,53 L2.6,53 C1.2,53 0,53.9 0,55 C0,56.1 1.1,57 2.6,57 L5.2,57 L7.7,57 C9.1,57 10.2,56.1 10.2,55 C10.2,54 9.1,53 7.7,53 L7.7,53 Z" stroke="#484848" type="MSShapeGroup"></path></g></g></svg>';

var bitMsgSVG = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="117px" height="32px" viewBox="0 0 117 32" version="1.1" class="replaced-svg"><title>bitmsg icon</title><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" type="MSPage"><g type="MSArtboardGroup" transform="translate(-444.000000, -918.000000)" fill="#000000"><path d="M454.742188,940.556641 C456.39454,940.556641 457.736323,940.035161 458.767578,938.992188 C459.798833,937.949214 460.314453,936.595711 460.314453,934.931641 C460.314453,933.302726 459.790044,931.960943 458.741211,930.90625 C457.692378,929.851557 456.359383,929.324219 454.742188,929.324219 C453.113273,929.324219 451.780279,929.848628 450.743164,930.897461 C449.70605,931.946294 449.1875,933.291007 449.1875,934.931641 C449.1875,936.572274 449.70605,937.919917 450.743164,938.974609 C451.780279,940.029302 453.113273,940.556641 454.742188,940.556641 L454.742188,940.556641 Z M449.257812,929.289062 C449.914066,928.468746 450.73437,927.841799 451.71875,927.408203 C452.70313,926.974607 453.8164,926.757812 455.058594,926.757812 C457.414074,926.757812 459.376945,927.55175 460.947266,929.139648 C462.517586,930.727547 463.302734,932.693348 463.302734,935.037109 C463.302734,937.345715 462.497078,939.302726 460.885742,940.908203 C459.274406,942.51368 457.308605,943.316406 454.988281,943.316406 C453.757806,943.316406 452.685551,943.099612 451.771484,942.666016 C450.857417,942.23242 450.107425,941.576176 449.521484,940.697266 L449.521484,942.103516 C449.521484,942.419923 449.465821,942.648437 449.354492,942.789062 C449.243164,942.929688 449.058595,943 448.800781,943 L445.583984,943 C445.126951,943 444.78711,942.894532 444.564453,942.683594 C444.341796,942.472655 444.230469,942.156252 444.230469,941.734375 C444.230469,941.265623 444.365233,940.94629 444.634766,940.776367 C444.904298,940.606444 445.437496,940.521484 446.234375,940.521484 L446.603516,940.521484 L446.603516,922.521484 L446.269531,922.521484 C445.472652,922.521484 444.927736,922.427735 444.634766,922.240234 C444.341795,922.052733 444.195312,921.724612 444.195312,921.255859 C444.195312,920.833982 444.312499,920.517579 444.546875,920.306641 C444.781251,920.095702 445.126951,919.990234 445.583984,919.990234 L448.255859,919.990234 C448.607424,919.990234 448.862304,920.048828 449.020508,920.166016 C449.178712,920.283204 449.257812,920.464843 449.257812,920.710938 L449.257812,929.289062 Z M470.779297,921.695312 C470.779297,920.429681 470.893554,919.632814 471.12207,919.304688 C471.350587,918.976561 471.83984,918.8125 472.589844,918.8125 C473.31641,918.8125 473.796874,918.950194 474.03125,919.225586 C474.265626,919.500978 474.382812,920.154292 474.382812,921.185547 C474.382812,922.193364 474.274415,922.817382 474.057617,923.057617 C473.840819,923.297853 473.351566,923.417969 472.589844,923.417969 C471.83984,923.417969 471.350587,923.306642 471.12207,923.083984 C470.893554,922.861327 470.779297,922.398441 470.779297,921.695312 L470.779297,921.695312 Z M474.03125,940.521484 L479.673828,940.521484 C480.130862,940.521484 480.467772,940.618163 480.68457,940.811523 C480.901368,941.004884 481.009766,941.312498 481.009766,941.734375 C481.009766,942.214846 480.907228,942.545898 480.702148,942.727539 C480.497069,942.909181 480.119143,943 479.568359,943 L465.927734,943 C465.458982,943 465.107423,942.894532 464.873047,942.683594 C464.638671,942.472655 464.521484,942.156252 464.521484,941.734375 C464.521484,941.324217 464.64453,941.019532 464.890625,940.820312 C465.13672,940.621093 465.505857,940.521484 465.998047,940.521484 L471.359375,940.521484 L471.359375,929.253906 L467.931641,929.253906 C467.451169,929.253906 467.084962,929.145509 466.833008,928.928711 C466.581053,928.711913 466.455078,928.39844 466.455078,927.988281 C466.455078,927.578123 466.572264,927.270509 466.806641,927.06543 C467.041017,926.860351 467.392576,926.757812 467.861328,926.757812 L473.011719,926.757812 C473.328127,926.757812 473.577148,926.822265 473.758789,926.951172 C473.940431,927.080079 474.03125,927.255858 474.03125,927.478516 L474.03125,940.521484 Z M493.798828,927.742188 C494.37305,927.742188 494.791991,927.841796 495.055664,928.041016 C495.319337,928.240235 495.451172,928.556638 495.451172,928.990234 C495.451172,929.400393 495.328126,929.708007 495.082031,929.913086 C494.835936,930.118165 494.466799,930.220703 493.974609,930.220703 L486.855469,930.220703 L486.855469,936.091797 C486.855469,938.013681 487.10449,939.279294 487.602539,939.888672 C488.100588,940.49805 488.953119,940.802734 490.160156,940.802734 C491.226568,940.802734 492.503899,940.492191 493.992188,939.871094 C495.480476,939.249997 496.400389,938.939453 496.751953,938.939453 C497.08008,938.939453 497.358397,939.056639 497.586914,939.291016 C497.815431,939.525392 497.929688,939.812498 497.929688,940.152344 C497.929688,940.539064 497.786134,940.875975 497.499023,941.163086 C497.211913,941.450197 496.72266,941.728514 496.03125,941.998047 C494.882807,942.45508 493.848637,942.789061 492.928711,943 C492.008784,943.210939 491.144535,943.316406 490.335938,943.316406 C488.964837,943.316406 487.813481,943.096682 486.881836,942.657227 C485.950191,942.217771 485.255862,941.564457 484.798828,940.697266 C484.564452,940.287107 484.397461,939.800784 484.297852,939.238281 C484.198242,938.675778 484.148438,937.8086 484.148438,936.636719 L484.148438,936.091797 L484.148438,930.220703 L481.160156,930.220703 C480.667966,930.220703 480.310548,930.124024 480.087891,929.930664 C479.865233,929.737304 479.753906,929.42383 479.753906,928.990234 C479.753906,928.509763 479.906248,928.181642 480.210938,928.005859 C480.515627,927.830077 481.166011,927.742188 482.162109,927.742188 L484.148438,927.742188 L484.148438,924.138672 L484.148438,923.207031 C484.148438,922.703122 484.256835,922.331056 484.473633,922.09082 C484.690431,921.850585 485.027341,921.730469 485.484375,921.730469 C486.000003,921.730469 486.357421,921.876952 486.556641,922.169922 C486.75586,922.462892 486.855469,923.130854 486.855469,924.173828 L486.855469,927.742188 L493.798828,927.742188 Z M517.125,933.208984 C517.125,931.556632 516.975587,930.440433 516.676758,929.860352 C516.377928,929.280271 515.865238,928.990234 515.138672,928.990234 C514.27148,928.990234 513.58301,929.365231 513.073242,930.115234 C512.563474,930.865238 512.308594,931.896478 512.308594,933.208984 L512.308594,940.521484 L512.625,940.521484 C513.339847,940.521484 513.817382,940.606444 514.057617,940.776367 C514.297853,940.94629 514.417969,941.265623 514.417969,941.734375 C514.417969,942.156252 514.31836,942.472655 514.119141,942.683594 C513.919921,942.894532 513.615236,943 513.205078,943 L510.972656,943 C510.468747,943 510.125977,942.882814 509.944336,942.648438 C509.762694,942.414061 509.671875,941.91016 509.671875,941.136719 L509.671875,940.626953 L509.671875,933.208984 L509.671875,931.837891 C509.671875,930.95898 509.472658,930.264651 509.074219,929.754883 C508.675779,929.245115 508.130863,928.990234 507.439453,928.990234 C506.912107,928.990234 506.428713,929.145506 505.989258,929.456055 C505.549802,929.766603 505.171877,930.226559 504.855469,930.835938 L504.855469,940.521484 L505.505859,940.521484 C506.208988,940.521484 506.683593,940.609374 506.929688,940.785156 C507.175782,940.960938 507.298828,941.277341 507.298828,941.734375 C507.298828,942.214846 507.19922,942.545898 507,942.727539 C506.80078,942.909181 506.419925,943 505.857422,943 L501.181641,943 C500.724607,943 500.387696,942.897462 500.170898,942.692383 C499.9541,942.487304 499.845703,942.167971 499.845703,941.734375 C499.845703,941.265623 499.983397,940.94629 500.258789,940.776367 C500.534181,940.606444 501.070309,940.521484 501.867188,940.521484 L502.21875,940.521484 L502.21875,929.253906 L501.902344,929.253906 C501.082027,929.253906 500.522462,929.160157 500.223633,928.972656 C499.924803,928.785155 499.775391,928.457034 499.775391,927.988281 C499.775391,927.578123 499.892577,927.270509 500.126953,927.06543 C500.361329,926.860351 500.712888,926.757812 501.181641,926.757812 L503.871094,926.757812 C504.257814,926.757812 504.512695,926.825195 504.635742,926.959961 C504.75879,927.094727 504.832031,927.378904 504.855469,927.8125 C505.33594,927.296872 505.85156,926.916017 506.402344,926.669922 C506.953128,926.423827 507.574215,926.300781 508.265625,926.300781 C509.085942,926.300781 509.762693,926.47949 510.295898,926.836914 C510.829104,927.194338 511.224608,927.736324 511.482422,928.462891 C511.974612,927.724606 512.542966,927.179689 513.1875,926.828125 C513.832034,926.476561 514.570308,926.300781 515.402344,926.300781 C516.91407,926.300781 518.018551,926.792964 518.71582,927.777344 C519.413089,928.761724 519.761719,930.355458 519.761719,932.558594 L519.761719,940.521484 L520.042969,940.521484 C520.769535,940.521484 521.255858,940.609374 521.501953,940.785156 C521.748048,940.960938 521.871094,941.277341 521.871094,941.734375 C521.871094,942.156252 521.765626,942.472655 521.554688,942.683594 C521.343749,942.894532 521.033205,943 520.623047,943 L518.496094,943 C518.027341,943 517.681642,942.859376 517.458984,942.578125 C517.236327,942.296874 517.125,941.851566 517.125,941.242188 L517.125,933.208984 Z M524.542969,941.734375 L524.542969,938.605469 C524.542969,938.089841 524.639647,937.720704 524.833008,937.498047 C525.026368,937.27539 525.339842,937.164062 525.773438,937.164062 C526.253909,937.164062 526.634764,937.492184 526.916016,938.148438 C527.103517,938.546877 527.273437,938.845702 527.425781,939.044922 C527.917971,939.677738 528.644526,940.184568 529.605469,940.56543 C530.566411,940.946291 531.626947,941.136719 532.787109,941.136719 C534.029303,941.136719 535.025387,940.884768 535.775391,940.380859 C536.525394,939.876951 536.900391,939.214848 536.900391,938.394531 C536.900391,937.562496 536.598636,936.970705 535.995117,936.619141 C535.391599,936.267576 534.357429,936.091797 532.892578,936.091797 L531.925781,936.091797 C529.535144,936.091797 527.712897,935.675785 526.458984,934.84375 C525.205072,934.011715 524.578125,932.804695 524.578125,931.222656 C524.578125,929.675774 525.190424,928.474614 526.415039,927.619141 C527.639655,926.763668 529.359364,926.335938 531.574219,926.335938 C532.476567,926.335938 533.39648,926.461913 534.333984,926.713867 C535.271489,926.965822 535.763672,927.091797 535.810547,927.091797 C535.939454,927.091797 536.185545,926.97754 536.548828,926.749023 C536.912111,926.520507 537.269529,926.40625 537.621094,926.40625 C538.019533,926.40625 538.315429,926.552733 538.508789,926.845703 C538.702149,927.138673 538.798828,927.578122 538.798828,928.164062 L538.798828,930.220703 C538.798828,930.8418 538.705079,931.290038 538.517578,931.56543 C538.330077,931.840822 538.031252,931.978516 537.621094,931.978516 C537.269529,931.978516 536.83594,931.67969 536.320312,931.082031 C535.957029,930.671873 535.658204,930.361329 535.423828,930.150391 C534.802731,929.576169 534.140629,929.163087 533.4375,928.911133 C532.734371,928.659178 531.908208,928.533203 530.958984,928.533203 C529.857416,928.533203 528.96973,928.776365 528.295898,929.262695 C527.622067,929.749026 527.285156,930.367184 527.285156,931.117188 C527.285156,931.855472 527.630856,932.382811 528.322266,932.699219 C529.013675,933.015627 530.501942,933.197265 532.787109,933.244141 C535.224622,933.302735 537.005854,933.727535 538.130859,934.518555 C539.255865,935.309574 539.818359,936.531242 539.818359,938.183594 C539.818359,939.765633 539.197272,941.031245 537.955078,941.980469 C536.712884,942.929692 535.03712,943.404297 532.927734,943.404297 C532.259762,943.404297 531.515629,943.342774 530.695312,943.219727 C529.874996,943.096679 528.843756,942.888673 527.601562,942.595703 C527.191404,942.865236 526.839845,943.067382 526.546875,943.202148 C526.253905,943.336915 526.007813,943.404297 525.808594,943.404297 C525.398435,943.404297 525.084962,943.260744 524.868164,942.973633 C524.651366,942.686522 524.542969,942.27344 524.542969,941.734375 L524.542969,941.734375 Z M550.318359,929.359375 C548.783195,929.359375 547.529302,929.83398 546.556641,930.783203 C545.58398,931.732427 545.097656,932.962883 545.097656,934.474609 C545.097656,935.962898 545.58398,937.184566 546.556641,938.139648 C547.529302,939.094731 548.783195,939.572266 550.318359,939.572266 C551.841804,939.572266 553.092769,939.094731 554.071289,938.139648 C555.04981,937.184566 555.539062,935.962898 555.539062,934.474609 C555.539062,932.986321 555.04981,931.761724 554.071289,930.800781 C553.092769,929.839839 551.841804,929.359375 550.318359,929.359375 L550.318359,929.359375 Z M557.947266,942.068359 C557.947266,943.708993 557.865235,944.872067 557.701172,945.557617 C557.537109,946.243167 557.255861,946.843747 556.857422,947.359375 C556.201169,948.226567 555.281256,948.88574 554.097656,949.336914 C552.914057,949.788088 551.519539,950.013672 549.914062,950.013672 C548.578118,950.013672 547.602542,949.884767 546.987305,949.626953 C546.372067,949.369139 546.064453,948.958987 546.064453,948.396484 C546.064453,948.033201 546.213866,947.713869 546.512695,947.438477 C546.811525,947.163085 547.166014,947.025391 547.576172,947.025391 C547.89258,947.025391 548.378903,947.069335 549.035156,947.157227 C549.69141,947.245118 550.189451,947.289062 550.529297,947.289062 C552.263681,947.289062 553.494137,946.890629 554.220703,946.09375 C554.947269,945.296871 555.310547,943.93165 555.310547,941.998047 L555.310547,939.871094 C554.5957,940.703129 553.804692,941.312498 552.9375,941.699219 C552.070308,942.085939 551.074224,942.279297 549.949219,942.279297 C547.757802,942.279297 545.944343,941.549812 544.508789,940.09082 C543.073235,938.631829 542.355469,936.783214 542.355469,934.544922 C542.355469,932.294911 543.093743,930.428718 544.570312,928.946289 C546.046882,927.46386 547.874989,926.722656 550.054688,926.722656 C550.957036,926.722656 551.838863,926.889647 552.700195,927.223633 C553.561528,927.557619 554.431636,928.06445 555.310547,928.744141 L555.310547,927.478516 C555.310547,927.232421 555.389648,927.050782 555.547852,926.933594 C555.706055,926.816406 555.955076,926.757812 556.294922,926.757812 L558.949219,926.757812 C559.417971,926.757812 559.76953,926.860351 560.003906,927.06543 C560.238282,927.270509 560.355469,927.578123 560.355469,927.988281 C560.355469,928.457034 560.208986,928.785155 559.916016,928.972656 C559.623045,929.160157 559.07227,929.253906 558.263672,929.253906 L557.947266,929.253906 L557.947266,942.068359 Z" type="MSShapeGroup"></path></g></g></svg>';

var announcePubSVG = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="announcePubSVG" x="0px" y="0px" width="70.358px" height="59.478px" viewBox="16.133 4.781 70.358 59.478" enable-background="new 16.133 4.781 70.358 59.478" xml:space="preserve"><path d="M84.926,27.63c-3.26-13.852-10.74-24.667-16.223-22.593c-0.222,0.074-0.814,0.37-1.629,0.815L67,5.926l-5.852,3.333  c0,0-35.26,21.111-41.333,24.815c-0.444-0.222-0.889-0.296-1.333-0.148c-2.148,0.519-2.963,4.889-1.852,9.778  c1.111,4.889,3.852,8.445,6,7.926c0.445-0.074,0.815-0.37,1.111-0.667c0.296,0,4.963,0.371,11.481,0.889  c0.074,6.445,5.037,11.852,11.63,12.371c6.519,0.518,12.592-4.593,13.333-10.52c11.186,0.815,19.926,1.482,16.814,1.26  c2.148,0.148,3.481,0.223,3.481,0.223C86.186,53.777,88.186,41.481,84.926,27.63z M47.148,59.926  c-4.222-0.296-7.555-3.703-7.777-7.852c5.185,0.37,11.037,0.814,16.592,1.26C55.074,57.334,51.371,60.223,47.148,59.926z   M79.814,52.223C75.963,53.186,70.407,44,67.593,31.852c-0.074-0.222-0.074-0.296-0.148-0.593c-2.296-10.667-2.222-21.852,2-23.185  c4.519-1.333,9.853,8,12.741,20.148c0,0.074,0.074,0.148,0.074,0.296C85,40.667,84.037,51.186,79.814,52.223z"></path></svg>';

var publishedArtifactSVG = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="blockchainSVG" x="0px" y="0px" width="45.925px" height="74.074px" viewBox="32.778 7.407 45.925 74.074" enable-background="new 32.778 7.407 45.925 74.074" xml:space="preserve"><path d="M72.25,53.334L61.666,42.922v-5.144h-5.185v-3.704h5.185V22.222h-5.135l-4.314-2.963h1.302V7.407H40.926v11.852h1.35  l-4.266,2.963h-5.232v11.852h11.852V22.222h-4.532l4.266-2.963h5.748l4.315,2.963h-4.612v11.852H55v3.704h-5.185V49.63H55v3.704  h-5.185v11.852H55v3.703h-5.185v12.593h11.851V68.889h-5.185v-3.703h5.185V53.334h-5.185V49.63h5.185v-5.005l8.881,8.709h-3.695  v11.852h11.852V53.334H72.25z M43.889,9.63h6.667v7.407h-6.667V9.63z"></path></svg>'

// GET ALL PUBLISHERS
function getAllPublishers() {
	document.getElementById('publisher-avatar').src = '';
	$('video').trigger('pause');
	$('#browse-media .module-links a.active').removeClass('active');
	document.getElementById('intro').style.display = 'none';
	$('.sharing-ui').hide();
	$('.wallet-ui').hide();
	$('.publisher-ui').hide();
	$('main').hide();
	document.getElementById('search').style.display = 'block';
	hideOverlay();
	resetInterface();
	$('.view-media-ui').hide();
	$('.view-publishers-ui').hide();
	console.log('loadRecentMedia() publisher/get/all ...');
	$.ajax({
		url: 'http://'+serverAddress+':41289/alexandria/v1/publisher/get/all',
		success: function (e) {
			var data = $.parseJSON(e);
			console.info(data);
			var stateObj = {
				currentView: 'publishers',
				searchResults: false
			}
			makeHistory(stateObj, 'ΛLΞXΛNDRIΛ > Publishers');
			populateSearchResults(data, 'publisher');
		},
		error: function (xhr, ajaxOptions, thrownError) {
			console.error(xhr.status);
			console.error(thrownError);
		}
	});
}

// PUBLISHER SINGLE ENTITY VIEW
function loadPublisherEntity(obj) {
	$('video').trigger('pause');
	var publisherNav = $(obj).parents('.publisher-entity').hasClass('publisher-entity');
	if (publisherNav == true) {
		var parentObj = $(obj).parents('.publisher-entity');
	} else {
		var parentObj = obj;
	}
	document.getElementById('publisher-avatar').src = '';
	loadPublisherView(parentObj);
}

// LOAD PUBLISHER ENTITY VIEW
function loadPublisherView(objMeta) {
	document.getElementById('publisher-avatar').src = '';
	$('#publisher-media-list li').remove();
	document.getElementById('intro').style.display = 'none';
	$('main').hide();
	hideOverlay();
	resetInterface();
	$('.wallet-ui').hide();
	$('.view-media-ui').hide();
	$('#view-publisher .entity-view').show();
	document.getElementById('search').style.display = 'block';
	document.getElementById('viewlabel').style.display = 'inline-block';
	$('.view-publishers-ui').show();
	document.getElementById('view-publisher').style.display = 'block';
	console.info(objMeta);
	var publisherID = '';
	if ( (objMeta.length == 34) || (objMeta.length == 64) ) {
		publisherID = objMeta;
	} else if (location.hash.slice(1).split('/')[2]) {
		publisherID = (objMeta) ? ($(objMeta).attr('id').split('-')[1]) : (location.hash.slice(1).split('/')[2]) ;
	} else if (location.hash.slice(1).split('/')[1]) {
		publisherID = (objMeta) ? ($(objMeta).attr('id').split('-')[1]) : (location.hash.slice(1).split('/')[1]) ;
	} else {
		publisherID = $(objMeta).attr('id').split('-')[1];
	}
	console.info(publisherID);
	var thisPublisher = (publisherID.length == 34) ? (searchAPI('publisher', 'address', publisherID)) : (searchAPI('publisher', 'txid', publisherID));
	console.info(thisPublisher);
	publisherID = thisPublisher[0]['txid'];
	thisPublisher = thisPublisher[0]['publisher-data']['alexandria-publisher'];
	var publisherAddress = thisPublisher['address'];
	generateQR(publisherAddress, 'tip-QR', 100, 100, 'florincoin');
	if (document.getElementById('sendTipBtn')) {
		document.getElementById('sendTipBtn').setAttribute('onclick','sendTip(this, FLOclient, "' + publisherAddress + '", FLO")');
	}
	var thisPublisherMedia = searchAPI('media', 'publisher', publisherAddress);
	console.info(thisPublisherMedia);
	var publisherName = thisPublisher['name'];
	var publisherTime = thisPublisher['timestamp'];
	var publisherMD5;
	if (thisPublisher['emailmd5'] != '') {
		publisherMD5 = thisPublisher['emailmd5'];
		document.getElementById('publisher-avatar').src = 'http://www.gravatar.com/avatar/'+publisherMD5;
		document.getElementById('publisher-avatar').style.display = 'block';
	} else {
		document.getElementById('publisher-avatar').style.display = 'none';
	}
	if (thisPublisher['bitmessage'] != '') {
		var publisherBitmsg = thisPublisher['bitmessage'];
		document.getElementById('publisher-bitmsg').style.display = 'inline-block';
		document.getElementById('bitmsg-address').innerHTML = publisherBitmsg;
	} else {
		document.getElementById('publisher-bitmsg').style.display = 'none';
	}
	publisherTime = new Date(parseInt(publisherTime));
	document.getElementById('view-publisher-name').innerHTML = publisherName;
	document.getElementById('publisher-FLO-address').innerHTML = publisherAddress;
	generateQR(publisherAddress, 'publisher-QR', 80, 80, 'florincoin');
	if (thisPublisherMedia) {
		for (var i = 0; i < thisPublisherMedia.length; i++) {
			var mediaID = thisPublisherMedia[i]['txid'];
			var mediaType = thisPublisherMedia[i]['media-data']['alexandria-media']['type'];
			var mediaInfo = thisPublisherMedia[i]['media-data']['alexandria-media']['info'];
			var mediaPubTime = thisPublisherMedia[i]['media-data']['alexandria-media']['timestamp'];
			var mediaPubTimeLen = thisPublisherMedia[i]['media-data']['alexandria-media']['timestamp'].toString().length;
			if (mediaPubTimeLen == 10) {
				mediaPubTime = parseInt(mediaPubTime)*1000;
			}					
			var mediaTitle = mediaInfo['title'];
			var mediaDesc = mediaInfo['description'];
			var mediaRuntime = 0;
			var mediaArtist = '';
			if (mediaInfo['extra-info']) {
				if(mediaInfo['extra-info']['runtime']){
					mediaRuntime = calcRuntime(mediaInfo['extra-info']['runtime']);
				}
				if(mediaInfo['extra-info']['artist']){
					mediaArtist = mediaInfo['extra-info']['artist'];
				}						
			}
			if (mediaRuntime != 0) {
				mediaRuntime = '<div class="media-runtime">Runtime: <span>' + mediaRuntime + '</span></div>';
			} else {
				mediaRuntime = '';
			}
			var mediaEntity = '<li id="media-' + mediaID + '" class="row media-entity" media-type="' + mediaType + '"><div class="browse-icon" onclick="loadMediaEntity(this);">'+mediaIconSVGs[mediaType]+'</div><h3 class="media-title" onclick="loadMediaEntity(this);">' + mediaTitle + '</h3> '+ mediaRuntime +' <a class="info-icon" onclick="loadInfoModal(this)">'+ infoIconSVG +'info</a><a class="playbtn-icon" onclick="loadMediaEntity(this);">'+ playIconSVG +'play</a><div class="media-pub-time hidden">' + new Date(parseInt(mediaPubTime)) + '</div><div class="media-desc hidden">' + mediaDesc + '</div></li>';
			$('#publisher-media-list').prepend(mediaEntity);
		}
	}
	var stateObj = {
		currentView: 'publisher',
		searchResults: false,
		subView : publisherAddress
	}
	makeHistory(stateObj, 'ΛLΞXΛNDRIΛ > Publishers > ' + publisherAddress);
	$('#view-publisher .entity-pub-time span').html(publisherTime);
}

// LOAD MEDIA ARTIFACT VIEW
function loadMediaEntity(obj) {
	$('#info-modal-media').fadeOut(fadeTimer);
	var parentObj = $(obj).parents('.media-entity');
	var mediaType = $(parentObj).attr('media-type');
	// Check Movie for IMDB Verification
	if (mediaType == 'movie') {
		// VERIFICATION DISABLED
			loadArtifactView(parentObj);
/*
		var mediaTxnID = $(parentObj).attr('id').split('-')[1];
		var IMDBid = $(parentObj).find('.media-www-id').text();
		var IMDBapi = 'http://www.myapifilms.com/imdb?idIMDB='+ IMDBid;
		$.ajax({
		    url: IMDBapi,
		    type: 'GET',
		    success: function(e) {
				var el = $( '#sketchpad' );
				el.html(e.responseText);
				var data = $.parseJSON($('p', el).html());
				if(data['simplePlot'].indexOf('Alexandria:') > -1) {
					var verifyTxn = data['simplePlot'].split('Alexandria:')[1];
					if (trim11(verifyTxn)== mediaTxnID) {
						loadArtifactView(parentObj);
					} else {
						alert('Incorrect TxnID');
						return false;
					}
				} else {
					alert('Not yet verified!');
					return false;
				}
		    },
			error: function (xhr, ajaxOptions, thrownError) {
				console.error(xhr.status);
				console.error(thrownError);
			}
	    });
  */
	} else {
		// Load Media Entity View
		if (mediaType == 'music') {
			loadArtifactView2(parentObj);
		} else {
			loadArtifactView(parentObj);
		}
	}
}

function IPFS (cmd, args) {
	args = args?('?' + Object.keys(args).map(function (k) { return k + '=' + args[k]}).join('&')):'';
	return getJSON('http://localhost:5001/api/v0/' + cmd + args)
}

function getJSON (url) {
	return Promise.resolve($.ajax({
		url: url,
		type: 'GET',
		dataType: 'JSON'
	}));
}

// v0.6 LOAD ARTIFACT VIEW
function loadArtifactView2(objMeta) {
	// HIDE OTHER VIEWS
	document.getElementById('intro').style.display = 'none';
	$('main').hide();
	hideOverlay();
	resetInterface();
	document.getElementById('search').style.display = 'block';
	$('.wallet-ui').hide();
	$('.publisher-ui').hide();
	$('.sharing-ui').hide();
	$('.view-publishers-ui').hide();
	$('#view-media .entity-view').hide();
	// SHOW MEDIA VIEW
	document.getElementById('view-artifact').style.display = 'block';
	var mediaID = '';
	// GET MEDIA ID FROM objMeta
	if ( (objMeta) && (objMeta.length == 1) ) {
		mediaID = $(objMeta).attr('id').split('-')[1];
	// GET MEDIA ID FROM LOCATION
	} else if (!objMeta) {
		if (location.hash.slice(1).split('/')[2]) {
			mediaID = location.hash.slice(1).split('/')[2];
		} else {
			mediaID = location.hash.slice(1).split('/')[1];
		}
	} else {
		mediaID = objMeta;
	}
	// GET ALL THE MEDIA DATA
	var thisMediaData = searchAPI('media', 'txid', mediaID);
    console.log (mediaID, thisMediaData);
    window.doMountMediaBrowser('#media-browser', thisMediaData);
}

// v0.5.1 LOAD ARTIFACT VIEW
function loadArtifactView(objMeta) {
	// THING AND VIDEO SPECIFIC SOMETHING
	function showMedia (mediaType){
		if (mediaType == 'thing') {
			if(mediaInfo['extra-info']) {
				if(mediaInfo['extra-info']['coverArt']) {
					fileHash = mediaInfo['extra-info']['coverArt'];
				}
			}
		}
		// VIDEO POSTER FRAME
		if ( (mediaType == 'video') && (wwwId != '') ) {
			if (!posterFrame) {
				var url = 'https://www.googleapis.com/youtube/v3/videos?key=AIzaSyBH_FceJKLSmo0hk9y2zBdZ8ZTmUiNJr8o&part=snippet&id='+ wwwId;
				$.ajax({
					url: url,
					type: 'GET',
					success: function(e) {
						var el = $( '#sketchpad' );
						el.html(e.responseText);
						var data = $.parseJSON($(el).html());
						var posterFrame = data['items'][0]['snippet']['thumbnails']['high']['url'];
						$('.media-embed video').attr('poster',posterFrame);
					},
					error: function (xhr, ajaxOptions, thrownError) {
						console.error(xhr.status);
						console.error(thrownError);
					},
					async:   false
				});
			}
		}
		// GET FILE EMBED
		var fileEmbed = embedArtifact(mediaType, fileHash, mediaFilename, posterFrame);
		$('.row.media-embed').html(fileEmbed);
		// IN APP DOWNLOAD LINK
		if (location.protocol == 'app:') {
			$('#media-Tid').attr('onclick', 'copyArtifact("http://' + IPFSserver + 'ipfs/'+ fileHash + '","'+process.env.HOME+'/Alexandria-Downloads/'+ fileHash + '")').show();
		}
	}
	// HIDE OTHER VIEWS
	document.getElementById('intro').style.display = 'none';
	$('main').hide();
	hideOverlay();
	resetInterface();
	document.getElementById('search').style.display = 'block';
	$('.wallet-ui').hide();
	$('.publisher-ui').hide();
	$('.sharing-ui').hide();
	$('.view-publishers-ui').hide();
	$('#view-media .entity-view').hide();
	// SHOW MEDIA VIEW
	document.getElementById('view-media').style.display = 'block';
	$('.row.media-embed').html('');
	$('#media-Tid').attr('href','').hide();
	var mediaID = '';
	// GET MEDIA ID FROM objMeta
	if ( (objMeta) && (objMeta.length == 1) ) {
		mediaID = $(objMeta).attr('id').split('-')[1];
	// GET MEDIA ID FROM LOCATION
	} else if (!objMeta) {
		if (location.hash.slice(1).split('/')[2]) {
			mediaID = location.hash.slice(1).split('/')[2];
		} else {
			mediaID = location.hash.slice(1).split('/')[1];
		}
	} else {
		mediaID = objMeta;
	}
	// GET ALL THE MEDIA DATA
	var thisMediaData = searchAPI('media', 'txid', mediaID);
	console.info(thisMediaData);
	mediaID = thisMediaData[0]['txid'];
	var mediaPublisher = thisMediaData[0]['publisher-name'];
	var publisherID = thisMediaData[0]['media-data']['alexandria-media']['publisher'];
	// GENERATE QR CODE FOR FLO TIPS
	generateQR(publisherID, 'tip-QR', 100, 100, 'florincoin');
	if (document.getElementById('sendTipBtn')) {
		document.getElementById('sendTipBtn').setAttribute('onclick','sendTip(this, FLOclient, "' + publisherID + '", "FLO")');
	}
	var media = thisMediaData[0]['media-data']['alexandria-media'];
	var mediaType = media.type;
	var mediaInfo = media.info;
	var mediaPubTime = media.timestamp;
	var mediaPubTimeLen = mediaPubTime.toString().length;
	if (mediaPubTimeLen == 10) {
		mediaPubTime = parseInt(mediaPubTime)*1000;
	}
	mediaPubTime  = new Date(parseInt(mediaPubTime));
	var mediaTitle = mediaInfo.title;
	var mediaDesc = mediaInfo.description;
	var mediaRuntime = 0;
	var mediaArtist = '';
	var mediaFilename = '';
	var wwwId = '';
	var mediaTid = media['torrent'];
	var mediaFLO = media['publisher'];
	if(media['payment']) {
		var mediaPymnt = media['payment'];
	}
	if ( (!mediaPymnt) || (mediaPymnt == 'none') ) {
		$('#view-media .tip-icon').hide();
	}
	// DISPLAY TIP JAR
	if ((mediaPymnt) && (mediaPymnt.type == 'tip')) {
		$('#view-media .tip-icon').show();
		$('.tip-amounts li').remove();
		var tipAmounts = media.payment.amount.split(',');
		for (var i = 0; i < tipAmounts.length; i++) {
			var thisTipAmount = tipAmounts[i]/100;
			var tipOption = '<li><input type="radio" name="tip-amount" id="tip-option-'+i+'" value="'+ thisTipAmount +'" onclick="changeTipAmount(this);"><label for="tip-option-'+i+'">$'+ thisTipAmount +'</label></li>';
			$('.tip-amounts').append(tipOption);
		}
		$('.tip-amounts').append('<li><input type="radio" name="tip-amount" id="tip-option-custom" value="5" onclick="changeTipAmount(this);" /><label for="tip-option-custom">$</label><input type="text" value="5.00" class="tip-input intInput" name="CustomTipAmount"  id="CustomTipAmount" onfocus="changeCustomTipAmount();" onKeyDown="prevTipAmountSet(this);" onKeyUp="customTipAmountInput(event, this);" /></li>');
	}

	var fileHash = mediaTid;
	// EXTRA INFO
	if(mediaInfo['extra-info']){
		var xinfo = mediaInfo['extra-info'];
		if(xinfo.runtime){
			mediaRuntime = calcRuntime(xinfo.runtime);
		}
		if(xinfo.artist){
			mediaArtist = xinfo.artist;
		}						
		if(xinfo.filename){
			mediaFilename = xinfo.filename;
		}
		if(xinfo.poster) {
			var poster = 'http://' + IPFSserver + '/ipfs/'+ fileHash +'/'+ xinfo.poster;
		}
		if(xinfo.posterFrame) {
			var posterFrame = 'http://' + IPFSserver + '/ipfs/'+ fileHash +'/'+ xinfo.posterFrame;
		}		
		if(xinfo.trailer) {
			var trailer = 'http://' + IPFSserver + '/ipfs/'+ fileHash +'/'+ xinfo.trailer;
		}
		if(xinfo.wwwId) {
			wwwId = xinfo.wwwId;
		}
		if(xinfo['Bitcoin Address']) {
			var mediaBTC = xinfo['Bitcoin Address'];
		}
		// SHOW/HIDE TRAILER LINK
		if (trailer) {
			$('#trailer-link').attr('data-source',trailer).show();
		} else {
			$('#trailer-link').attr('data-source',trailer).hide();
		}
		// PAY WHAT YOU WANT WALL + MEDIA EMBED
		if(xinfo.pwyw) {
			var PWYW = xinfo.pwyw;
			var pwywSuggUSD = PWYW[0]/100;
			console.info(pwywSuggUSD);
			$('.pwyw-wall-amount').val(pwywSuggUSD);
//			$('.pwyw-wall-pin').hide();

			IPFS('version')
				.catch (function (e) {
					console.error ("ipfs NOT runing, paywall")
					/* ipfs not running locally */
					$('.ipfs-running').hide()
					$('.ipfs-not-running').show()
					showPWYWModal(mediaType, fileHash, mediaFilename);
				})
				.then (function () {
					$('.ipfs-running').show()
					$('.ipfs-not-running').hide()
//					$('.pwyw-wall-pin').show();
					return IPFS('pin/ls', {type: 'all'})
				})
				.then (function(pinned) {
					/* look for file in pinned */
					if (! pinned.keys[fileHash])
						throw new Error ('hash not pinned');

					showMedia(mediaType);
				})
				.catch (function (e) {
					showPWYWModal(mediaType, fileHash, mediaFilename);
				})
		} else {
			showMedia(mediaType);
		}
	}
	// ROTTEN TOMATOES FOR MOVIES
	if (mediaType == 'movie') {
		getRotten();
	}
	// SHOW AND BUILD MEDIA UI
	$('.view-media-ui').show();
	document.getElementById('viewlabel').style.display = 'inline-block';
	$('#media-txnID').html(mediaID);	
	$('main:visible .FLO-address').html(mediaFLO);
	if (mediaBTC) {
		$('main:visible .BTC-address').html(mediaBTC);
		if (document.getElementById('sendBTCTipBtn')) {
			generateQR(mediaBTC, 'BTC-tip-QR', 100, 100, 'bitcoin');
			document.getElementById('sendBTCTipBtn').setAttribute('onclick','sendTip(this, BTCclient, "' + mediaBTC + '", "BTC")');
		}
	}
	$('#media-view-entity .entity-meta-header h2').html(mediaTitle);
	if (mediaArtist) {
		document.getElementById('media-artist-name').outerHTML = '<h3 id="media-artist-name" onclick="searchByField(&apos;media&apos;, &apos;info_extra&apos;, &apos;'+ mediaArtist +'&apos;)">'+ mediaArtist +'</h3>';
	}
	document.getElementById('entity-runtime').innerHTML = mediaRuntime;
	$('#media-view-entity .entity-meta-header .media-header').hide();
	$('#media-view-entity .entity-meta-header .media-header.media-'+mediaType).show();
	// $('#media-view-entity .media-image').html(mediaIcon);
	$('#media-view-entity .entity-pub-time span').html(mediaPubTime);
	// POSTER FRAME
	if (poster) {
		mediaDesc = '<img src="'+poster+'" class="media-poster" />'+ mediaDesc;
	}
	$('#media-view-entity .media-desc').html('<p>'+ mediaDesc +'</p>');
	// IF MUSIC THEN GET TRACKS
	if (mediaType == 'music') {
		getTracks(mediaTid, mediaInfo, 2);
	}
	$('#media-view-entity .entity-footer').hide();
	$('#media-view-entity .entity-footer.media-'+mediaType).show();
	$('#media-view-entity').show();
	var stateObj = {
		currentView: 'artifact',
		searchResults: false,
		subView: mediaID,
		artifactTitle: mediaTitle,
		mediaType: mediaType,
		artifactPublisher: mediaPublisher,
		publisherId: publisherID
	}
	// MAKE HISTORY ARTIFACT VIEW
	makeHistory(stateObj, 'ΛLΞXΛNDRIΛ > Media > ' + stateObj.mediaType.charAt(0).toUpperCase() + stateObj.mediaType.slice(1) + ' > ' + stateObj.artifactTitle);
}

// GET ALBUM TRACKS
function getTracks(fileHash, mediaInfo, trackCount) {
	if (trackCount < 10) {
		var trackNo = '0'+ trackCount;
	} else {
		var trackNo = trackCount;
	}
	if (mediaInfo['extra-info']['track'+ trackNo]) {
		var trackFile = mediaInfo['extra-info']['track'+ trackNo];
		console.info(trackFile);
		if ($('#media-view-entity .media-desc #track-list').length < 1) {
			if(mediaInfo['extra-info']['filename']){
				mediaFilename = mediaInfo['extra-info']['filename'];
			}
			$('#media-view-entity .media-desc').append('<ol id="track-list"><li onclick="changeAudioTrack(this)">'+ mediaFilename +'</li></ol>');
		}
		$('#media-view-entity .media-desc #track-list').append('<li onclick="changeAudioTrack(this)">'+trackFile+'</li>');
		trackCount++;
		getTracks(fileHash, mediaInfo, trackCount);
	} else {
		return false;
	}
}

// EMBED ARTIFACT FROM DHT
function embedArtifact(mediaType, fileHash, mediaFilename, posterFrame) {
	if (mediaFilename == 'none') {
		mediaFilename = '';
	}
	if ( (mediaType == 'video') || (mediaType == 'movie') ) {
		if (!posterFrame) {
			var posterFrame = '';
		}
//		if (location.protocol == 'app:') {
//			var embedCode = '<embed type="application/x-vlc-plugin" pluginspage="http://www.videolan.org" target="http://' + IPFSserver +'/ipfs/'+ fileHash +'/'+ encodeURIComponent(mediaFilename) +'" width="640px" height="360px" />';
//		} else {
			var embedCode = '<video controls="controls" poster="'+ posterFrame +'"><source src="http://' + IPFSserver +'/ipfs/'+ fileHash +'/'+ encodeURIComponent(mediaFilename) +'" type="video/mp4" /><param name="autoplay" value="true" /></video>';	
//		}
	} else if ( (mediaType == 'music') || (mediaType == 'podcast') ) {
// 		if (location.protocol == 'app:') {
//			var embedCode = '<embed type="application/x-vlc-plugin" pluginspage="http://www.videolan.org" target="http://' + IPFSserver +'/ipfs/'+ fileHash +'/'+ encodeURIComponent(mediaFilename) +'" width="640px" height="100px" />';
//		} else {
			var embedCode = '<audio controls="controls"><source src="http://' + IPFSserver +'/ipfs/'+ fileHash +'/'+ encodeURIComponent(mediaFilename) +'" type="audio/mp3" /></audio>';
//		}
	} else if (mediaType == 'book') {
		var embedCode = '<object data="http://' + IPFSserver +'/ipfs/'+ fileHash + '" type="application/pdf" width="100%" height="800px" class="book-embed"><p>No PDF plugin installed. You can <a href="http://' + IPFSserver +'/ipfs/'+ fileHash +'">click here to download the PDF file.</a></p></object>'
	} else if (mediaType == 'recipe') {
		var embedCode = '<object data="http://' + IPFSserver +'/ipfs/'+fileHash+'" type="text/html" width="100%" height="620px" />';
	} else if (mediaType == 'thing') {
		var embedCode = '<img src="http://' + IPFSserver +'/ipfs/'+fileHash+'" class="large-poster" />';
	}
	return embedCode;
}

// CHANGE AUDIO TRACK
function changeAudioTrack(obj) {
	var audioPlayer = $('audio:visible');
	var fileHash = $('audio:visible source').attr('src').split('/')[4];
	var trackFile = $(obj).text();
	$('audio:visible source').attr('src', 'http://' + IPFSserver +'/ipfs/'+ fileHash +'/'+ encodeURIComponent(trackFile));
	audioPlayer.load();
}

// CHANGE CUSTOM TIP AMOUNT
function changeCustomTipAmount() {
	$('#tip-option-custom').click();
}

// CHANGE FLO TIP AMOUNT
function changeTipAmount(opt) {
	var tipAmount = ($(opt).attr('id')=='tip-option-custom') ? (parseFloat($(opt).siblings('.tip-input').val())) : parseFloat($(opt).val()) ;
	$('.tip-value').text(tipAmount);
	$('#tip-modal .flo-usd-output').text(Math.round((tipAmount/FLOUSD)*100)/100);
	$('#tip-modal .btc-usd-output').text(Math.round((tipAmount/BTCUSD)*100000000)/100000000);
}

// SET CUSTOM TIP AMOUNT BY INPUT
function prevTipAmountSet(obj) {
	prevTipAmount = obj.value;
}

function customTipAmountInput(event, obj) {
	var charCode = event.keyCode;
	var tipAmount = obj.value;
	if ( ( (charCode > 64) && (charCode < 91) ) || ( (charCode > 105) && (charCode < 144) ) || (charCode > 185)  && (charCode != 190) ) {
		tipAmount = parseFloat(obj.value);
		obj.value = prevTipAmount;
		if (obj == document.getElementById('CustomTipAmount')) {
			$('.tip-value').text(prevTipAmount);
			$('#tip-modal .flo-usd-output').text(Math.round((prevTipAmount/FLOUSD)*100000000)/100000000);
		}
		alert('Input a valid amount.');
	} else if ( (tipAmount != prevTipAmount) && (tipAmount != '') ) {
		var decValue = tipAmount.split('.')[1];
		if(decValue) {
			if (decValue.length > 2){
				console.log(decValue[0]);
				decValue = decValue[0].toString() + decValue[1].toString();
				tipAmount = tipAmount.split('.')[0]+'.'+decValue;
				obj.value = tipAmount;
			}
		}
		if (obj == document.getElementById('CustomTipAmount')) {
			document.getElementById('tip-option-custom').value = tipAmount;
			$('.tip-value').text(tipAmount);
			$('.flo-usd-output').text(Math.round((tipAmount/FLOUSD)*100000000)/100000000);
		}
	}
}

// GENERAL SEARCH
function fullSearch(searchFor) {
	$('main').not('#browse-media').hide();
	$('.sharing-ui').hide();
	$('.wallet-ui').hide();
	$('.publisher-ui').hide();
	$('.view-media-ui').hide();
	$('.view-publishers-ui').hide();
	hideOverlay();
	resetInterface();
	document.getElementById('search').style.display = 'block';
	var publisherResults = searchAPI('publisher', 'name', searchFor);
	var mediaResults = searchAPI('media', '*', searchFor);
	$('#adv-search').fadeOut(fadeTimer);
	var stateObj = {
		currentView: 'search',
		searchResults: true
	}
	stateObj.searchTerm = (document.getElementById('search-main').value != '') ? (document.getElementById('search-main').value) : (searchFor);
	makeHistory(stateObj, 'ΛLΞXΛNDRIΛ > Search > '+ stateObj.searchTerm);
	populateSearchResults(publisherResults, 'publisher');
	populateSearchResults(mediaResults, 'media');
}

// ADVANCED SEARCH
function selectSearchMediaType(obj){
	$(obj).toggleClass('active');
	$('#adv-search .module-links a.active').each(function(){
		// filterTypes.push($(this).attr('value'));
	});
}

// EXECUTE ADVANCED SEARCH
function buildSearch() {
	$('main').not('#browse-media').hide();
	hideOverlay();
	resetInterface();
	document.getElementById('search').style.display = 'block';
	$('.sharing-ui').hide();
	$('.wallet-ui').hide();
	$('.publisher-ui').hide();
	$('.view-media-ui').hide();
	$('.view-publishers-ui').hide();
	var searchProtocol = document.getElementById('searchModule').value;
	var searchOn = (searchProtocol == 'media') ? (searchOn = '*') : (searchOn = 'name') ;
	var AdvSearchResults = searchAPI(searchProtocol, searchOn, document.getElementById('searchTermInput').value);	
	$('#adv-search').fadeOut(fadeTimer);
	document.getElementById('search-main').value = document.getElementById('searchTermInput').value;
	$('#browse-media .module-links a').removeClass('active');
	var filterTypes = [];
	$('#adv-search .module-links a.active').each(function(){
		filterTypes.push($(this).attr('value'));
		$('#browse-media .module-links a[value="'+$(this).attr('value')+'"]').addClass('active');
	});
	var stateObj = {
		currentView: 'search',
		searchResults: true,
		searchTerm: document.getElementById('searchTermInput').value,
		mediaTypes: filterTypes,
		module: searchProtocol
	}
	makeHistory(stateObj, 'ΛLΞXΛNDRIΛ > '+ searchProtocol.charAt(0).toUpperCase() + searchProtocol.slice(1) +' > Search > '+ stateObj.searchTerm);
	populateSearchResults(AdvSearchResults, searchProtocol);
	document.getElementById('searchTermInput').value = '';
}

// CLEAR ADVANCED SEARCH
function cancelSearch() {
	$('#adv-search').fadeToggle(fadeTimer).find('input[type="text"]').val('');
}

// SEARCH BY FIELD
function searchByField(module, searchOn, searchFor) {
	var AdvSearchResults = searchAPI(module, searchOn, searchFor);
	$('main').not('#browse-media').hide();
	hideOverlay();
	resetInterface();
	document.getElementById('search').style.display = 'block';
	$('#browse-media .module-links a').removeClass('active');
	$('.view-media-ui').hide();
	$('.view-publishers-ui').hide();
	var stateObj = {
		currentView: 'search',
		searchResults: true,
		searchTerm: searchFor,
		module: module,
		searchOn: searchOn
	}
	console.info(stateObj);
	makeHistory(stateObj, 'ΛLΞXΛNDRIΛ > '+ stateObj.module.charAt(0).toUpperCase() + stateObj.module.slice(1) +' > Search > ' + searchOn + ' > ' + stateObj.searchTerm.charAt(0).toUpperCase() + stateObj.searchTerm.slice(1));
	populateSearchResults(AdvSearchResults, module);
}
var resetSearch = 0;

// MEDIA TYPE FILTER
function setMediaTypeFilter(obj, resetSearch) {
	var filterTypes = '';
	if(!obj) {
		$('#browse-media .module-links a.active').removeClass('active');
	} else {
		filterTypes = $(obj).attr('value');
		if ($('#browse-media .module-links a[value="'+ filterTypes +'"]').hasClass('active')) {
			$('#browse-media .module-links a[value="'+ filterTypes +'"]').removeClass('active');
		} else {
			$('#browse-media .module-links a[value="'+ filterTypes +'"]').addClass('active');
		}
	}
	filterMediaByType(filterTypes, resetSearch);
}

function filterMediaByType(obj, resetSearch) {
	$('video').trigger('pause');
	document.getElementById('intro').style.display = 'none';
	$('main').not('#browse-media').hide();
	$('body').append($('#info-modal-media'));
	$('#browse-media-wrap .row').remove();
	$('.sharing-ui').hide();
	$('.wallet-ui').hide();
	$('.publisher-ui').hide();
	document.getElementById('search').style.display = 'block';
	document.getElementById('share-modal').style.display = 'none';
	document.getElementById('tip-modal').style.display = 'none';
	$('#user-modal').fadeOut(fadeTimer);
	$('.view-media-ui').hide();
	$('.view-publishers-ui').hide();
	document.getElementById('publisher-avatar').src = '';
	console.info(history.state);
	console.info(obj);
	if ( ( (obj == '') && (history.state) && (history.state.searchResults != true) ) || (resetSearch) && ( (history.state) && (!history.state.isFront) ) ) {
		var filteredMedia = searchAPI('media', '*', '');
		console.info(filteredMedia);
		$('#browse-media .module-links a.active').removeClass('active');
		var stateObj = {
			currentView: 'media',
			searchResults: false
		}
		makeHistory(stateObj, 'ΛLΞXΛNDRIΛ > Media');
		populateSearchResults(filteredMedia, 'media');
		return false;
	} else {
		var filterTypes = [obj];
		if ( (history.state) && (history.state.mediaTypes) ) {
			for (var i = 0; i < history.state.mediaTypes.length; i++) {
				filterTypes.push(history.state.mediaTypes[i]);
			}
		}
		Array.prototype.unique = function (){  
		    var r = new Array();  
		    o:for(var i = 0, n = this.length; i < n; i++){
		    	var z = 0;
		        for(var x = 0, y = r.length; x < y; x++){  
		            if (r[x]==this[i]) {
						Array.prototype.remove = function(from, to) {
							var rest = this.slice((to || from) + 1 || this.length);
							this.length = from < 0 ? this.length + from : from;
							return this.push.apply(this, rest);
						};				
						r.remove(x);
						this.remove(i);
						z++;
		            }
	            } 
		        r[r.length] = this[i];
	        } 
			Array.prototype.clean = function(deleteValue) {
			  for (var i = 0; i < this.length; i++) {
			    if (this[i] == deleteValue) {         
			      this.splice(i, 1);
			      i--;
			    }
			  }
			  return this;
			};
			
			r.clean(undefined);
		    return r;  
		}
		console.log(filterTypes[0]);
		if (filterTypes[0]) {
			filterTypes = filterTypes.unique();
		} else {
			filterTypes.length = 0;
		}
		var filterTypesStr = (filterTypes.length < 2) ? (filterTypes) : ('');
		if (filterTypes.length > 1) {
			for (var i = 0; i < filterTypes.length; i++) {
				if (filterTypesStr == '') {
					filterTypesStr = '"'+ filterTypes[i]+'"';
				} else {
					filterTypesStr = filterTypesStr+',"'+ filterTypes[i]+'"';
				}
			}
		}
		$('#browse-media .module-links a[value="'+ filterTypes +'"]').addClass('active');
			console.info(history.state);
		if ( (!history.state) || (history.state.searchResults != true) ) {
			console.log(filterTypesStr);
			var filteredMedia = searchAPI('media', 'type', filterTypesStr);
			var stateObj = {
				currentView: 'media',
				searchResults: false,
				mediaTypes: filterTypes
			}
			if (!history.state) {
				stateObj.isFront = true;
			}
			if (filterTypes[0]) {
				stateObj.mediaTypes = filterTypes;
			}
			var titleStr = '';
			if (stateObj.mediaTypes[0]) {
				for (var i = 0; i < stateObj.mediaTypes.length; i++) {
					titleStr = (titleStr == '') ? (stateObj.mediaTypes[i].charAt(0).toUpperCase() + stateObj.mediaTypes[i].slice(1) + 's') : (titleStr + ' + ' + stateObj.mediaTypes[i].charAt(0).toUpperCase() + stateObj.mediaTypes[i].slice(1) + 's');
				}
				titleStr = ' > ' + titleStr;	
			}
			console.info(stateObj);
			makeHistory(stateObj, 'ΛLΞXΛNDRIΛ > Media' + titleStr);
		} else {
			if ( (history.state) && (!history.state.isFront) ) {
				var stateObj = {
					currentView: 'search',
					searchResults: true,
					module: 'media'
				}
				stateObj.mediaTypes = (obj != '') ? (filterTypes) : ('');
				stateObj.searchTerm = (history.state.searchTerm) ? (history.state.searchTerm) : ('');
				var filteredMedia = searchAPI('media', '*', stateObj.searchTerm);
				makeHistory(stateObj, 'ΛLΞXΛNDRIΛ > '+ stateObj.module.charAt(0).toUpperCase() + stateObj.module.slice(1) +' > Search > '+ stateObj.searchTerm);
			}
		}
	}
	console.log(history.state);
	populateSearchResults(filteredMedia, 'media');
}

// POPULATE SEARCH RESULTS
function populateSearchResults(results, module) {
	artifact = '';
	if (module == 'publishers') {
		module = 'publisher';
	};
	$('#'+module+'-results-title').remove();
	if ( (module =='media') && (results) ) {
		for (var i = 0; i < results.length; i++) {
			var mediaType = results[i]['media-data']['alexandria-media']['type'];
			if ( (history.state) && (history.state.mediaTypes) ) {
				if ( (history.state.mediaTypes.length > 0) && (history.state.searchResults == true) && (history.state.mediaTypes.indexOf(mediaType) == -1) ) {
					continue;
				}
			}
			var mediaID = results[i]['txid'];
			var mediaPublisher = results[i]['publisher-name'];
			var mediaInfo = results[i]['media-data']['alexandria-media']['info'];
			var mediaPubTime = results[i]['media-data']['alexandria-media']['timestamp'];
			var mediaPubTimeLen = results[i]['media-data']['alexandria-media']['timestamp'].toString().length;
			if (mediaPubTimeLen == 10) {
				mediaPubTime = parseInt(mediaPubTime)*1000;
			}					
			var mediaTitle = mediaInfo['title'];
			var mediaDesc = mediaInfo['description'];
			var mediaRuntime = 0;
			var mediaArtist = '';
			if(mediaInfo['extra-info']){
				if(mediaInfo['extra-info']['runtime']){
					mediaRuntime = calcRuntime(mediaInfo['extra-info']['runtime']);
				}
				if(mediaInfo['extra-info']['artist']){
					mediaArtist = mediaInfo['extra-info']['artist'];
				}						
			}
			if (mediaRuntime != 0) {
				mediaRuntime = '<div class="media-runtime">Runtime: <span>' + mediaRuntime + '</span></div>';
			} else {
				mediaRuntime = '';
			}
			var mediaEntity = '<div id="media-' + mediaID + '" class="row media-entity" media-type="' + mediaType + '"><div class="browse-icon" onclick="loadMediaEntity(this);">'+mediaIconSVGs[mediaType]+'</div><h3 class="media-title" onclick="loadMediaEntity(this);">' + mediaTitle + '</h3> <div class="media-meta" onclick="loadMediaEntity(this);">' + mediaPublisher + '</div> '+ mediaRuntime +' <a class="info-icon" onclick="loadInfoModal(this)">'+ infoIconSVG +'info</a><a class="playbtn-icon" onclick="loadMediaEntity(this);">'+ playIconSVG +'play</a><div class="media-pub-time hidden">' + new Date(parseInt(mediaPubTime)) + '</div><div class="media-desc hidden">' + mediaDesc + '</div>';
			if ($('#browse-media-wrap #'+module+'-results-wrap .row').length < 1){
				$('#browse-media-wrap #'+module+'-results-wrap').append(mediaEntity);
			} else {
				$('#browse-media-wrap #'+module+'-results-wrap .row:first-of-type').before(mediaEntity);
			}
		}
		$('#browse-media-wrap #'+module+'-results-wrap .row.'+module+'-entity:first-of-type').addClass('first');
	} else if ( (module =='publisher') && (results) ) {
		for (var i = 0; i < results.length; i++) {
			var publisherID = results[i]['txid'];
			var publisherName = results[i]['publisher-data']['alexandria-publisher']['name'];
			var publisherDate = results[i]['publisher-data']['alexandria-publisher']['timestamp'];
			var publisherDateLen = results[i]['publisher-data']['alexandria-publisher']['timestamp'].toString().length;
			if (publisherDateLen == 10) {
				publisherDate = parseInt(publisherDate)*1000;
			}
			var publisherEntity = '<div id="publisher-' + publisherID + '" class="row publisher-entity"><div class="browse-icon publisher-icon" onclick="loadPublisherEntity(this);">'+ publisherIconSVG +'</div><h3 class="publisher-title" onclick="loadPublisherEntity(this);">' + publisherName + '</h3> <div class="publisher-date">' + new Date(parseInt(publisherDate)) + '</div>';
			if ($('#browse-media-wrap #'+module+'-results-wrap .row').length < 1){
				$('#browse-media-wrap #'+module+'-results-wrap').append(publisherEntity);
			} else {
				$('#browse-media-wrap #'+module+'-results-wrap .row:first-of-type').before(publisherEntity);
			}
		}
		$('#browse-media-wrap #'+module+'-results-wrap .row.'+module+'-entity:first-of-type').addClass('first');
	}
	if (!results) {
		var mediaIcon = (module == 'media') ? (mediaIconSVGs['media']) : (publisherIconSVG);
		var mediaEntity = '<div class="row '+module+'-entity"><div class="'+module+'-icon browse-icon">'+ mediaIcon +'</div><h3 class="'+module+'-title">No Results Found</h3></div>';
		$('#browse-media-wrap #'+module+'-results-wrap').append(mediaEntity);
		$('#browse-media-wrap .row.'+module+'-entity:first-of-type').addClass('first');
	}
	$('#browse-media .row.'+module+'-entity.first').each(function(){
		var resultsTitle = (module == 'publisher') ? ('Publishers') : ('Media');
		$(this).before('<h2 id="'+module+'-results-title">'+resultsTitle+'</h2>');
	});
	$('#browse-media .container').each(function(){
		if ($(this).children().length == 0) {
			$(this).hide();
		} else {
			$(this).show();
		}
	});
	$('#browse-media').show();	
}

// DISPLAY MEDIA INFO MODAL
function loadInfoModal(childObj) {
    var parentObj = childObj.parentNode;
    if ( $(parentObj).hasClass('media-entity') ) {
	    // LOAD MEDIA ENTITY INFO MODAL
		if ( ($('#info-modal-media').css('display') == 'block') && ($('#info-modal-media').css('opacity')==1) ) {
			$('#info-modal-media').fadeOut(fadeTimer);
			return false;
		}
		if ($(parentObj).find('#info-modal-media').length == 0) {
			$(parentObj).append($('#info-modal-media'));
		}
		var mediaRuntime = $(parentObj).find('.media-runtime').html();
		var mediaPubTime = $(parentObj).find('.media-pub-time').html();
		var mediaTitle = $(parentObj).find('.media-title').html();
		var mediaMeta = $(parentObj).find('.media-meta').html();
		var mediaDesc = $(parentObj).find('.media-desc').html();
		var mediaIcon = $(parentObj).find('.browse-icon').html();
		$('#info-modal-media .entity-meta-header h2').html(mediaTitle);
		$('#info-modal-media .entity-meta-header h3').html(mediaMeta);
		$('#info-modal-media .entity-meta-header .entity-runtime').html(mediaRuntime);
		$('#info-modal-media .media-image').html(mediaIcon);
		$('#info-modal-media .entity-pub-time span').html(mediaPubTime);	
		$('#info-modal-media .media-desc').html('<p>'+ mediaDesc +'</p>');
		$(childObj).siblings('#info-modal-media').fadeIn(fadeTimer);
    } else {
        if ($(parentObj.parentNode).hasClass('col')) {    	
			if ( ($('#info-modal-small').css('display') == 'block') && ($('#info-modal-small').css('opacity')==1) ) {
				$('#info-modal-small').fadeOut(fadeTimer);
				return false;
			}
        }
		// INFO MODAL for LI
		$('#info-modal-small').html('');
		var localFile = ($(childObj).siblings('label').length != 0) ? ($(childObj).siblings('label').text()) : ($(childObj).parent().siblings('label').text());
		localFile = localFile.replace(/\s/g , "-").toLowerCase();
		getInfoFile(localFile);
		if ($(childObj).find('#info-modal-small').length == 0) {
			$(childObj).append($('#info-modal-small'));
		}
		var infoInterval = setInterval(function() {
		    if ($(childObj).find('#info-modal-small').html()!='') {
		        clearInterval(infoInterval);
				$(childObj).find('#info-modal-small').fadeIn(fadeTimer);
		    }
		}, 100);
    }
}

// LOAD LOCAL HTML FILES FOR INFO MODAL
function getInfoFile(localFile) {
	var localURL = 'modals/info-'+ localFile +'.html';
	$.ajax({
	    url: localURL,
	    type: 'GET',
	    success: function(res) {
			$('#info-modal-small').html(res);
	    }
	});
}

// LOAD ADD CONTENT MODAL
function loadAddContentModal() {
	$('#add-menu-modal.abs').fadeToggle(fadeTimer);
}
// LOAD USER MODAL
function loadUserModal() {
	$('#user-modal.abs').fadeToggle(fadeTimer);
}

// CALCULATE RUNTIME FROM SECONDS
function calcRuntime(seconds) {
	var runSecs = seconds;
	var runMins = 0;
	var runHours = 0;
	if (runSecs > 59) {
		runMins = Math.floor(parseInt(seconds)/60);
		runSecs = runSecs-(runMins*60);
	}
	if (runSecs < 10) {
		runSecs = '0' + runSecs;
	}
	if (runMins > 59) {
		runHours = Math.floor(parseInt(runMins)/60);
		runMins = runMins-(runHours*60);
	}
	if (runMins < 10) {
		runMins = '0' + runMins;
	}
	if (runHours < 10) {
		runHours = '0' + runHours;
	}
	var runtime = runHours + ':' + runMins + ':' + runSecs;
	return runtime;
}

// CHECK RUNTIME VALIDITY
function isRuntime(runtime) {
	var runtimeError = 0;
	var runtimeArray = runtime.value.split(':');
	console.log(runtimeArray.length);
	console.info(runtimeArray);
	if (runtimeArray.length < 3) {
		runtimeError = 1;
	}
	for (var i = 0; i < runtimeArray.length; i++) {
		for (var i2 = 0; i2 < runtimeArray[i].length; i2++) {
			console.log(isNaN(parseInt(runtimeArray[i][i2])));
			if (isNaN(parseInt(runtimeArray[i][i2]))) {
				runtimeError = 1;
			}
		}
		if ( (runtimeArray[i].length > 2) || ( (i > 0) && (runtimeArray[i] > 59) ) || (isNaN(parseInt(runtimeArray[i]))) ) {
			runtimeError = 1;
		}
	}
	if (runtimeError != 0) {
		alert('Please input a valid runtime');	
	}
}

// CALCULATE SECONDS FROM RUNTIME
function calcSeconds(runtime) {
	if (!runtime) {
		return false;
	}
	var runtimeArray = runtime.split(':');
	if (runtimeArray.length < 3) {
		alert('Please input a valid runtime');
	}
	var runtimeHours = parseInt(runtimeArray[0]);
	var runtimeMins = parseInt(runtimeArray[1]);
	var runtimeSeconds = parseInt(runtimeArray[2]);
	runtimeSeconds = ((runtimeHours*60)*60)+(runtimeMins*60)+runtimeSeconds;
	return runtimeSeconds;
}

// DISPLAY SHARE MODAL
function loadShareModal(obj) {
	if ($(obj).parents('.entity-market #share-modal').length == 0) {
		$(obj).parents('.entity-market').append($('#share-modal'));
	}
	var modalPos = (history.state.currentView == 'artifact') ? ('right') : ('left');
	var shareModalPos = (history.state.currentView == 'artifact') ? ($(obj).parent().width() - $(obj).position().left - 91) : ($(obj).position().left - 40);
	document.getElementById('share-url').innerHTML = location.hash.slice(2);
	document.getElementById('share-title').innerHTML = $('.entity-meta-header h2:visible').text();
	$(obj).parents('.entity-market').find('#share-modal').css(modalPos, shareModalPos +'px').fadeToggle(fadeTimer);
}

// DISPLAY TIP MODAL
function loadTipModal(obj) {
	if ($(obj).parents('.entity-market #tip-modal').length == 0) {
		$(obj).parents('.entity-market').append($('#tip-modal'));
	}
	$('input[name="tip-amount"]:eq(2)').click();
	var mediaFLO = $('main:visible .FLO-address').html();
	var mediaBTC = $('main:visible .BTC-address').html();
	if (mediaFLO != '') {
		$('#tipAdd-FLO').html(mediaFLO);
	} else {
		$('#tipAdd-FLO').text('No Address Available');
	}
	if (mediaBTC != '') {
		$('#tipAdd-BTC').html(mediaBTC);
		$('.modal-tabs li[name="tip-bitcoin"]').removeClass('hidden');
	} else {
		$('#tipAdd-BTC').text('No Address Available');
		$('.modal-tabs li[name="tip-bitcoin"]').addClass('hidden');
	}
	$('#tip-modal .modal-tabs li').not('.hidden').first().click();
	var modalPos = (history.state.currentView == 'artifact') ? ('right') : ('left');
	var tipModalPos = (history.state.currentView == 'artifact') ? ($(obj).parent().width() - $(obj).position().left - 76) : ($(obj).position().left - 50);
	$(obj).parents('.entity-market').find('#tip-modal').css(modalPos,tipModalPos+'px').fadeToggle(fadeTimer);
}

// SEND TIP WITH FLORINCOIN-QT WALLET
function sendTip(obj, client, pubAdd, currency) {
	if ($(obj).hasClass('disabled')) {
		return false;
	}	
	console.info(obj);
	console.info(client);
	console.info(pubAdd);
	if (currency == 'FLO') {
		if (FLOauth.length == 0) {
			document.getElementById('wallet-user').value = '';
			document.getElementById('wallet-token').value = '';		
			document.getElementById('wallet-connect-currency').innerHTML = 'Florincoin';
			$('#wallet-connect-btn').attr('onclick','connectWallet(this, "'+currency+'")');
			$('#wallet-auth-modal').fadeIn(fadeTimer);
			document.getElementById('app-overlay').style.display = 'block';
			$(obj).removeClass('disabled');
			return false;
		}
		var tipAmount = $('input[name="tip-amount"]:checked').val()/FLOUSD;
		tipAmount = Math.round(tipAmount*100000000)/100000000;
	} else if (currency == 'BTC') {
		if (BTCauth.length == 0) {
			document.getElementById('wallet-user').value = '';
			document.getElementById('wallet-token').value = '';		
			document.getElementById('wallet-connect-currency').innerHTML = 'Bitcoin';
			$('#wallet-connect-btn').attr('onclick','connectWallet(this, "'+currency+'")');
			$('#wallet-auth-modal').fadeIn(fadeTimer);
			document.getElementById('app-overlay').style.display = 'block';
			$(obj).removeClass('disabled');
			return false;
		}
		var tipAmount = $('input[name="tip-amount"]:checked').val()/BTCUSD;
		tipAmount = Math.round(tipAmount*100000000)/100000000;
	}
	var txComment = document.getElementById('tip-comment').value;
	console.log(txComment);
	if (window.confirm('Send '+ tipAmount + ' '+currency+' tip to ' + pubAdd + '?')) { 
		$(obj).addClass('disabled');
		if (currency == 'FLO') {
			client.cmd('sendtoaddress', pubAdd, tipAmount, '', '', txComment, function(err, txid, resHeaders){
				if (err) {
					console.log(err);
					$(obj).removeClass('disabled');
				} else {
					$('#tip-modal').fadeOut(fadeTimer);
					document.getElementById('tip-comment').value = '';
			    	alertModal('Tip Sent!');
					$(obj).removeClass('disabled');
	//					getBalance('', client);
				}
			});
		} else if (currency == 'BTC') {
			client.cmd('sendtoaddress', pubAdd, tipAmount, function(err, txid, resHeaders){
				if (err) {
					console.log(err);
					$(obj).removeClass('disabled');
				} else {
					$('#tip-modal').fadeOut(fadeTimer);
			    	alertModal('Tip Sent!');
					$(obj).removeClass('disabled');
	//					getBalance('', client);
				}
			});
		}
	}
}

// DISPLAY QR CODE FOR BTC
function loadQR(obj) {
	$('#lightbox').html('<div id="qrcode-lightbox"></div>');
	var qrcode = new QRCode("qrcode-lightbox", {
		text: obj,
		width: 400,
		height: 400,
		colorDark : "#000000",
		colorLight : "#FFFFFF",
		correctLevel : QRCode.CorrectLevel.H
	});
	$('#lightbox').fadeIn(fadeTimer);
}

// DISPLAY BITMSG MODAL
function bitMsgModal() {
	if ( (document.getElementById('bitmsg-modal').style.display == 'none') || (document.getElementById('bitmsg-modal').style.display == '') ) {
		document.getElementById('bitmsg-modal').style.display = 'block';
	} else {
		document.getElementById('bitmsg-modal').style.display = 'none';
	}
}

// DISPLAY TRADE MODAL
function tradeModal() {
	if ( (document.getElementById('trade-modal').style.display == 'none') || (document.getElementById('trade-modal').style.display == '') ) {
		var floAddress = document.getElementById('wallet-address-select').value;
		if (floAddress == '') {
			alert('Please select a Florincoin address');
		} else {
			$.ajax({
				url: 'http://trade.blocktech.com:5000/flobalance',
				success: function(e) {
					document.getElementById('trade-balance').innerHTML = Math.round((.5*e*(Math.round((FLOUSD/BTCUSD)*100000000)/100000000))*100000000)/100000000;
				}
			});
			$.ajax({
				url: 'http://tradebot.alexandria.io/depositaddress?floaddress='+floAddress,
				success: function(e) {
					document.getElementById('trade-address').innerHTML = e;
					document.getElementById('trade-modal').style.display = 'block';
				}
			});
		}
	} else {
		document.getElementById('trade-modal').style.display = 'none';
	}
}

// NEW MEDIA MODULE
function loadShareMod() {
	document.getElementById('search').style.display = 'none';
	$('.header-modal').hide();
	$('.view-media-ui').hide();
	document.getElementById('intro').style.display = 'none';
	$('main').not('.sharing-ui').hide();
	$('.wallet-ui').hide();
	$('.publisher-ui').hide();
	$('.sharing-ui').show();
	resizeTabs(true);
	var stateObj = {
		currentView: 'add-media'
	}
	makeHistory(stateObj, 'ΛLΞXΛNDRIΛ > Add Media');
	console.info(FLOauth);
	if (FLOauth.length == 0) {
			document.getElementById('wallet-user').value = '';
			document.getElementById('wallet-token').value = '';		
			document.getElementById('wallet-connect-currency').innerHTML = 'Florincoin';
			$('#wallet-connect-btn').attr('onclick','connectWallet(this, "FLO")');
			$('#wallet-auth-modal').fadeIn(fadeTimer);
			document.getElementById('app-overlay').style.display = 'block';
	}
}

// ADD MEDIA TAB PAGINATION
function paginateMediaTabs(obj) {
	var activeTab = $('#add-media-menu li.active');
	if ($(obj).hasClass('next')) {
		$(activeTab).next('#add-media-menu li').click();
	} else if ($(obj).hasClass('prev')) {
		$(activeTab).prev('#add-media-menu li').click();
	} else if ($(obj).hasClass('submit')) {
		if($('#mediaType').val() == ''){
			$('#add-media nav ul li:first-child').click();
			alert('Please select a media type');
			return false;
		}
		var reqCheck = mediaReqCheck();
		console.log(reqCheck);
		if (reqCheck == true) {
			showTipAlexandriaModal();
		}
	}
}

// NEW PUBLISHER MODULE
function loadCreatePublisherMod() {
	$('.header-modal').hide();
	var stateObj = {
		currentView: 'add-publisher'
	}
	makeHistory(stateObj, 'ΛLΞXΛNDRIΛ > Add Publisher');
	document.getElementById('search').style.display = 'none';
	document.getElementById('intro').style.display = 'none';
	$('main').not('.publisher-ui').hide();
	$('.wallet-ui').hide();
	$('.sharing-ui').hide();
	$('.publisher-ui').show();
	resizeTabs(true);
	if (FLOauth.length == 0) {
			document.getElementById('wallet-user').value = '';
			document.getElementById('wallet-token').value = '';		
			document.getElementById('wallet-connect-currency').innerHTML = 'Florincoin';
			$('#wallet-connect-btn').attr('onclick','connectWallet(this, "FLO")');
			$('#wallet-auth-modal').fadeIn(fadeTimer);
			document.getElementById('app-overlay').style.display = 'block';
	}	
}

// PARSE MAGNET URI
function parseMagnetURI() {
	var errorCheck = 0;
	if (document.getElementById('dht-hash').value == '') {
		return false;
	}
	var magnetURI = document.getElementById('dht-hash').value;
	var isMagnet = magnetURI.indexOf('magnet:?xt=urn:');
	console.log(isMagnet);
	if (isMagnet > -1) {
		var hasTR = magnetURI.indexOf('&tr=');
		var hasWS = magnetURI.indexOf('&ws=');
		var mediaBTIH = magnetURI.split('urn:')[1].split('&')[0];
		document.getElementById('btih-hash').value = mediaBTIH;
		if (hasTR > 0) {
			var mediaTR = magnetURI.split('&tr=');
			var thisTR = [magnetURI.split('&tr=')[1].split('&')[0]];
			if (magnetURI.split('&tr=').length > 2) {
				for (var i = 1; i < magnetURI.split('&tr=').length; i++) {
					thisTR.push(magnetURI.split('&tr=')[i].split('&')[0]);
				}	
			}
			console.log(thisTR);
		}
		if (hasWS > 0) {
			var mediaWS = magnetURI.split('&ws=');
			var thisWS = [magnetURI.split('&ws=')[1].split('&')[0]];
			if (magnetURI.split('&ws=').length > 2) {
				for (var i = 1; i < magnetURI.split('&ws=').length; i++) {
					thisWS.push(magnetURI.split('&ws=')[i].split('&')[0]);
				}
			}
			console.log(thisWS);
		}
	} else {
		document.getElementById('btih-hash').value = magnetURI;
	}
}

// CHECK TIP AMOUNTS ARE USD VALUES
function checkTipAmounts() {
	var tipError = 0;
	var TipInputs = document.getElementsByClassName('set-tip-amount');
	for (i = 0; i < TipInputs.length; i++) {
		var tipValue = $(TipInputs[i]).val();
		if (tipValue != '') {
			for (i2 = 0; i2 < tipValue.length; i2++) {
				if ( (!tipValue[i2] == '.') && (isNaN(parseInt(tipValue[i2]))) ) {
					tipError = 1;
				}
			}
		}
		if (tipValue.split('.')) {
			var deci = tipValue.split('.')[1];
			if ( ( (deci) && (deci.length > 2) ) || (tipValue.split('.').length > 2) ) {
				tipError = 1;
			}
		}
	}
	if (tipError == 1) {
		alert('Input a valid tip amount');
		return false;
	}
}

// SUBMIT PUBLISHER TO BLOCKCHAIN
function postPublisher(obj, client) {
	$(obj).addClass('disabled');
	var pubName = document.getElementById('newPublisher-name').value;
	var pubAdd = document.getElementById('newPublisher-floAdd').value;
	var pubBTC = document.getElementById('newPublisher-btcAdd').value;
	var pubEmailMD5 = '';
	if ( (pubName == '') || (pubAdd == '') ) {
		alert('Incomplete input');
		$(obj).removeClass('disabled');
		return false;
	}	
	if (document.getElementById('newPublisher-emailmd5').value != '') {
		pubEmailMD5 = MD5(trim11(document.getElementById('newPublisher-emailmd5').value).toLowerCase());
	}
	var pubBitMsg = document.getElementById('newPublisher-bitmsg').value;
	var pubTime = Date.parse(new Date()).toString();
	var sigString = pubName + '-' + pubAdd + '-' + pubTime;
	console.info(sigString);
	client.cmd('signmessage', pubAdd, sigString, function(err, sig, resHeaders){
		if (err) {
			console.log(err);
			$(obj).removeClass('disabled');
		} else {
			console.log(sig);
			var queryString = '{ "alexandria-publisher": { "name": "'+ pubName +'", "address": "'+ pubAdd +'", "timestamp":'+ pubTime +', "bitcoin": "'+pubBTC+'", "bitmessage": "'+ pubBitMsg +'", "emailmd5":"'+ pubEmailMD5 +'"}, "signature":"'+ sig +'"}';
			sendPublisherTxn(obj, client, pubAdd, queryString);
		}
	});
}

// SEND PUBLISHER TXN
function sendPublisherTxn(obj, client, pubAdd, queryString) {
	if (window.confirm('Create new Publisher for ' + pubAdd + '?')) { 
		client.cmd('sendtoaddress', pubAdd, 1, '', '', queryString, function(err, txid, resHeaders){
			if (err) {
				console.log(err);
				$(obj).removeClass('disabled');
			} else {
		    	$('.publisher-ui').hide();
		    	resetAlexandria();
		    	$('#publisher-process input[type="text"]').val('');
		    	alertModal(announcePubSVG+'<br />Publisher Announced!');
				$(obj).removeClass('disabled');
			}
		});	
	} else {
		$(obj).removeClass('disabled');
	}
}

// ADD MEDIA TABS
function changeAddMediaTab(obj) {
	$(obj).addClass('active').siblings().removeClass('active');
	$('#newMedia-tabs').find('.modal-tab#'+$(obj).attr("name")).show().siblings().hide();
	var activeTabName = $('#add-media-menu li.active').attr('name');
	$('#add-media .pagination ul li').show();
	resizeTabs(true);
	var firstTab = $('#add-media-menu li:first-child').attr('name');
	var lastTab = $('#add-media-menu li:last-child').attr('name');
	if (activeTabName == lastTab) {
		$('#add-media .pagination ul li:last-child').removeClass('next').addClass('submit').text('Publish');
	} else {
		$('#add-media .pagination ul li:last-child').removeClass('submit').addClass('next').text('Next');
	}
	if (activeTabName == firstTab) {
		$('#add-media .pagination ul li.prev').hide();
	}
}

// SHOW AUTOFILL ON ADD MEDIA
var mediaWwwID = '';
function showAutoFill(obj){
	if ( (obj.value != '') && (obj.value != mediaWwwID) ) {
		$('fieldset:visible input').attr('disabled','disabled');
		$('fieldset:visible textarea').attr('disabled','disabled');
		$(obj).parents('fieldset').find('.autofill-button').slideDown(fadeTimer);
		mediaWwwID = obj.value;
		if ($(obj).siblings('label').text().split(' ')[0] == 'IMDB') {
			getIMDBinfo();
		} else if ($(obj).siblings('label').text().split(' ')[0] == 'YouTube') {
			getYouTubeinfo();
		} else if ($(obj).siblings('label').text().split(' ')[0] == 'Soundcloud') {
			getSoundcloudInfo();
		}
	} else {
		$(obj).parents('fieldset').find('.autofill-button').slideUp(fadeTimer);
	}
}

// GET IMDB INFO FOR AUTOFILL
function getIMDBinfo() {
//	var IMDBid = document.getElementById('www-id').value;
	var IMDBid = 'tt1273193';
	var IMDBapi = 'http://www.myapifilms.com/imdb?idIMDB='+ mediaWwwID +'&actors=S&uniqueName=1';
	$.ajax({
	    url: IMDBapi,
//	    type: 'GET',
	    success: function(e) {
			var data = e;
			console.info(data);
			var errorCode = data['code'];
			if (errorCode) {
				alert(data['message']);
				$('fieldset:visible input').val('');
				$('fieldset:visible textarea').val('');
			} else {
				for (var key in data) {
					var obj = data[key];
					console.info(key);
					console.info(obj);
					var inputObj = document.getElementById('addMedia-'+key);
					if (key == 'urlPoster') {
						$('.thumbnail-wrapper:visible').html('<p><a href="'+ obj +'" target="_blank" class="btnLightGray">Download from IMDB</a></p>');
					} else if (inputObj) {
						console.info(inputObj);
						var length = 0;
						var newObj = [];
						if(typeof obj == 'object'){
							if (typeof obj[0] == 'object') {
								for (var objIndex in obj) {
									var subObj = obj[objIndex];
									if (key == 'actors') {
										newObj.push(subObj['actorName']);
									} else {
							            ++length;
										for (var subkey in subObj) {
											if(subObj[subkey].substring(0,2) != 'nm'){
												newObj.push(subObj[subkey]);
											}
										}
									}
								}
							} else {
								obj.forEach(function(a,i){
						            ++length;
									newObj.push(obj[i]);
								});
							}
							obj = newObj;
						}
						var IMDBResult = '';
						if (typeof obj == 'object') {
							obj.forEach(function(a){
								if (IMDBResult == '') {
									IMDBResult = a;
								} else {
									IMDBResult = IMDBResult + ', ' + a;
								}
							});
						} else {
							IMDBResult = obj;
						}		
						inputObj.value = IMDBResult;
					}
				}
			}
			$('.modal-tab:visible .autofill-button').slideUp(fadeTimer);
			$('fieldset:visible input').removeAttr('disabled');
			$('fieldset:visible textarea').removeAttr('disabled');
	    },
		error: function (xhr, ajaxOptions, thrownError) {
			console.error(xhr.status);
			console.error(thrownError);
		}
	});
}
// GET YOUTUBE INFO FOR AUTOFILL
function getYouTubeinfo() {
	var YouTubeId = document.getElementById('www-id').value;
	var url = 'https://www.googleapis.com/youtube/v3/videos?key=AIzaSyBH_FceJKLSmo0hk9y2zBdZ8ZTmUiNJr8o&part=snippet&id='+ YouTubeId;
	$.ajax({
	    url: url,
	    type: 'GET',
	    success: function(e) {
			var el = $( '#sketchpad' );
			el.html(e.responseText);
			var data = $.parseJSON($(el).html());
			var mediaData = data['items'][0]['snippet'];
			document.getElementById('addMedia-title').value = mediaData['title'];
			document.getElementById('addMedia-creators1').value = mediaData['channelTitle'];
			document.getElementById('addMedia-desc').innerHTML = mediaData['description'];
	    },
		error: function (xhr, ajaxOptions, thrownError) {
			console.error(xhr.status);
			console.error(thrownError);
	    }
    });
	$('.modal-tab:visible .autofill-button').slideUp(fadeTimer);
	$('fieldset:visible input').removeAttr('disabled');
	$('fieldset:visible textarea').removeAttr('disabled');	
}
// GET SOUNDCLOUD INFO FOR AUTOFILL
function getSoundcloudInfo() {
	var SoundcloudId = document.getElementById('www-id').value;
	var url = 'https://api.soundcloud.com/tracks/'+ SoundcloudId + '.json?client_id=0e74cd0666418c8b8a26f967b1e3a7bb';
	$.ajax({
	    url: url,
	    success: function(e) {
	    	console.info(e);
			document.getElementById('addMedia-title').value = e['title'];
			document.getElementById('addMedia-creators1').value = e['user']['username'];
			document.getElementById('addMedia-runtime').value = e['duration'];
			document.getElementById('addMedia-year').value = e['release_year'];
			document.getElementById('addMedia-genres').value = e['genre'];
			document.getElementById('addMedia-desc').innerHTML = e['description'];
	    },
		error: function (xhr, ajaxOptions, thrownError) {
			if (xhr.status == 404) {
				alert('Soundcloud ID not found');
				$('fieldset:visible input').val('');
				$('fieldset:visible textarea').val('');
			}
			console.error(xhr.status);
			console.error(thrownError);
	    }
    });
	$('.modal-tab:visible .autofill-button').slideUp(fadeTimer);
	$('fieldset:visible input').removeAttr('disabled');
	$('fieldset:visible textarea').removeAttr('disabled');	
}

// GET ROTTEN TOMATOES RATING
function getRotten() {
	var RottenID = parseInt(document.getElementById('movie-rotten').innerHTML);
	var RottenAPI = 'http://api.rottentomatoes.com/api/public/v1.0/movies/'+ RottenID +'.json?apikey=uatf974sbyb7reyrstwnpmzu';
	$.ajax({
	    url: RottenAPI,
	    type: 'GET',
	    success: function(e) {
			var el = $( '#sketchpad' );
			el.html(e.responseText);
			var data = $.parseJSON($('p', el).html());
			console.info(data);
			var rating = data['ratings']['audience_score'];
	    	document.getElementById('movie-rotten').innerHTML = rating;
	    	if ( rating < 50 ) {
	    		document.getElementById('rotten-img').src = 'img/rotten-tomatos-rotten.svg';
	    	} else {
	    		document.getElementById('rotten-img').src = 'img/rotten-tomatos-fresh.svg';
	    	}
	    	document.getElementById('rotten-wrap').style.display = 'inline-block';
	    },
		error: function (xhr, ajaxOptions, thrownError) {
			console.error(xhr.status);
			console.error(thrownError);
		}
    });
}

// CHECK REQUIRED FIELDS FOR MEDIA SUBMISSION
function mediaReqCheck() {
	var reqCheck = 0;
	if (document.getElementById('newMediaPublisherFLO').value == '') {
		alert('Please select a Publisher address');
		reqCheck = 1;
	}
	$('#add-media .required').each(function(){
		var inputValue = $(this).find('input');
		if ( !inputValue[0] ) {
			var inputValue = $(this).find('textarea');
		}
		if ( (!$(inputValue).val()) || ($(inputValue).val() == '') ) {
			var inputName = $(inputValue).siblings('label').text();
			$('#add-media nav ul li:first-child').click();
			alert('Please input a '+ inputName);
			reqCheck = 1;
		}
	});
	if (document.getElementById('payment-tips').checked) {
		checkTipAmounts();
	}
	if ( (document.getElementById('newMediaPublisherFLO').value.length != 34) && (document.getElementById('newMediaPublisherFLO').value != '') ) {
		alert('Please input a valid Florincoin Address');
	}
	if (reqCheck == 1) {
		reqCheck = 0;
		hideOverlay();
		return false;
	} else {
		return true;
	}
}

// LOAD DEACTIVATE MEDIA MODAL
function loadDeactivateModal() {
	$('#deactivate-media-modal').fadeIn(fadeTimer);
	document.getElementById('app-overlay').style.display = 'block';
}

// DEACTIVATE MEDIA
function deactivateMedia(obj) {
	$(obj).addClass('disabled');
	var TxId = document.getElementById('deactivate-txid').value;
	var FLOadd = document.getElementById('deactivate-address').value;
	var sigQueryString = '{ "address":"'+ FLOadd +'", "text":"'+ FLOadd + '-' + TxId +'" }';
	console.log(sigQueryString);
	var signature;
	var stopError = 0;
	$.ajax({
	    url: 'http://'+ serverAddress +':41289/alexandria/v1/sign',
	    type: 'POST',
		data: sigQueryString.toString(),
	    success: function(e) {
			var res = $.parseJSON(e);
			if (res['status'] == 'failure') {
				alert(res['response'][0]);
				stopError = 1;
			} else {
				signature = res['response'][0];
			}
	    }, 
		error: function (xhr, ajaxOptions, thrownError) {
			console.error(xhr.status);
			console.error(thrownError);
		},
		async:   false
	});
	if (stopError == 1) {
		signature = false;
	}		

	console.info(signature);
	if (signature == false) {
		return false;
	}
/*		
	FLOclient.cmd('signmessage', FLOadd, sigString, function(err, sig, resHeaders){
		if (err) {
			console.log(err);
			$(obj).removeClass('disabled');
		} else {
			console.log(sig);
			sendMediaTxn(obj, FLOclient, TxId, queryString);
		}
	});
*/
	var queryString = '{ "alexandria-deactivation": { "address": "'+ FLOadd +'", "txid": "'+ TxId +'" }, "signature":"'+ signature +'" }';
	console.info(queryString);
	if (window.confirm('Deactivate Artifact?')) { 
		$.ajax({
		    url: 'http://'+ serverAddress +':41289/alexandria/v1/send',
		    type: 'POST',
			data: queryString.toString(),
		    success: function(e) {
				hideOverlay();		    	
		    	$('.sharing-ui').hide();
		    	resetAlexandria();
		    	alertModal('Media Deactivated!');
		    },
			error: function (xhr, ajaxOptions, thrownError) {
				console.error(xhr.status);
				console.error(thrownError);
			}
		});
	}
}

// SEND MEDIA TXN TO BLOCKCHAIN
function sendMediaTxn(obj, client, txid, queryString) {
	if (window.confirm('Publish Media with TxId: ' + txid + '?')) { 
		var FLOadd = document.getElementById('newMediaPublisherFLO').value;
		client.cmd('sendtoaddress', FLOadd, 1, '', '', queryString, function(err, txid, resHeaders){
			if (err) {
				console.log(err);
				$(obj).removeClass('disabled');
			} else {
				hideOverlay();
		    	resetAlexandria();
		    	alert('Media Deactivated! TxId: ' + txid);
				$(obj).removeClass('disabled');
			}
		});
	} else {
		$(obj).removeClass('disabled');
	}
}

// LOAD TIP-TO-ALEXANDRIA MODAL
function showTipAlexandriaModal() {
	getCryptos();
	$('#tip-alexandria-modal').fadeIn(fadeTimer);
	document.getElementById('app-overlay').style.display = 'block';
}

// LOAD PAY-WHAT-YOU-WANT MODAL
function showPWYWModal(mediaType, fileHash, mediaFilename) {
	getCryptos();
	$('#pwyw-modal .btnLightGray').attr('data-type', mediaType);
	$('#pwyw-modal .btnLightGray').attr('data-hash', fileHash);
	$('#pwyw-modal .btnLightGray').attr('data-file', mediaFilename);
	$('#pwyw-modal').fadeIn(fadeTimer);
	$('#pwyw-modal .modal-tabs li:first-child').click();
	document.getElementById('app-overlay').style.display = 'block';
}

function unlockPWYW(obj, currency) {
	if (currency == 'PIN') {
		var request = require('request'),
			fileHash = $('#pwyw-modal .btnLightGray').attr('data-hash');


		$('#pwyw-pin-error').text('');
		request ("http://localhost:8079/api/ipfs/pin/add/" + fileHash, function (err, res, data) {
			if (err) {
	            $('#pwyw-pin-error').text('You must have Librarian installed and running in order to use this feature.').show();
				return;
			}
			
			data = JSON.parse(data);
			
            if (data.status == "ok") {
				$('#pwyw-pin-error').text('');
				var mediaType = $('#pwyw-modal .btnLightGray').attr('data-type');
				var mediaFilename = $('#pwyw-modal .btnLightGray').attr('data-file');
				var fileEmbed = embedArtifact(mediaType, fileHash, mediaFilename);
				$('.row.media-embed').html(fileEmbed);
				var mediaTitle = $('.entity-meta-header h2').text();
				$('#media-Tid').attr('href','magnet:?xt=urn:'+fileHash+'&dn='+escape(mediaTitle)).show();
				hideOverlay();
				$(obj).removeClass('disabled');
            } else if (data.status == "error") {
                if (data.error.indexOf('already pinned recursively') > -1) {
					$('#pwyw-pin-error').text('');
					var mediaType = $('#pwyw-modal .btnLightGray').attr('data-type');
					var mediaFilename = $('#pwyw-modal .btnLightGray').attr('data-file');
					var fileEmbed = embedArtifact(mediaType, fileHash, mediaFilename);
					$('.row.media-embed').html(fileEmbed);
					var mediaTitle = $('.entity-meta-header h2').text();
					$('#media-Tid').attr('href','magnet:?xt=urn:'+fileHash+'&dn='+escape(mediaTitle)).show();
					hideOverlay();
					$(obj).removeClass('disabled');
                } else {
					$('#pwyw-pin-error').text('An unknown error has occured, please make sure you have Librarian installed and running.');
                }
            } else {
				$('#pwyw-pin-error').text('An unknown error has occured, please make sure you have Librarian installed and running.');
            }
		})
		
		return;
	}
	$(obj).addClass('disabled');
	var pwywAmount = $('.pwyw-wall-amount:visible').val();
	var FLOadd = $('main:visible .FLO-address').html();
	var BTCadd = $('main:visible .BTC-address').html();
	if (currency == 'FLO') {
		var FLOamount = Math.round((pwywAmount/FLOUSD)*100000)/100000;
		FLOclient.cmd('sendtoaddress', FLOadd, FLOamount, '', '', '', function(err, txid, resHeaders){
			if (err) {
				console.log(err);
				$(obj).removeClass('disabled');
			} else {
				var mediaType = $('#pwyw-modal .btnLightGray').attr('data-type');
				var fileHash = $('#pwyw-modal .btnLightGray').attr('data-hash');
				var mediaFilename = $('#pwyw-modal .btnLightGray').attr('data-file');
				var fileEmbed = embedArtifact(mediaType, fileHash, mediaFilename);
				$('.row.media-embed').html(fileEmbed);
				var mediaTitle = $('.entity-meta-header h2').text();
				$('#media-Tid').attr('href','magnet:?xt=urn:'+fileHash+'&dn='+escape(mediaTitle)).show();
				hideOverlay();
				$(obj).removeClass('disabled');
			}
		});
	} else if (currency == 'BTC') {
		var BTCamount = Math.round((pwywAmount/BTCUSD)*100000)/100000;
		BTCclient.cmd('sendtoaddress', BTCadd, BTCamount, function(err, txid, resHeaders){
			if (err) {
				console.log(err);
				$(obj).removeClass('disabled');
			} else {
				var mediaType = $('#pwyw-modal .btnLightGray').attr('data-type');
				var fileHash = $('#pwyw-modal .btnLightGray').attr('data-hash');
				var mediaFilename = $('#pwyw-modal .btnLightGray').attr('data-file');
				var fileEmbed = embedArtifact(mediaType, fileHash, mediaFilename);
				$('.row.media-embed').html(fileEmbed);
				var mediaTitle = $('.entity-meta-header h2').text();
				$('#media-Tid').attr('href','magnet:?xt=urn:'+fileHash+'&dn='+escape(mediaTitle)).show();
				hideOverlay();
				$(obj).removeClass('disabled');
			}
		});
	}
}

// HIDE OVERLAY AND MODAL
function hideOverlay() {
	$('.overlay-modal').fadeOut(fadeTimer);
	$('.overlay-modal input[type="text"]').val('');
	document.getElementById('disabler').style.display = 'none';	
	document.getElementById('app-overlay').style.display = 'none';
}

// SELECT MEDIA TYPE ON ADD MEDIA
function selectMediaType(obj, mediaType) {
	$('#media-type-select-list a').removeClass('active');
	obj.className = 'active';
	$('#newMedia-info fieldset').hide();
	if (mediaType != '' ) {
		$('#newMedia-info .left').fadeIn(fadeTimer);
		$('#newMedia-info .pull-right').fadeIn(fadeTimer);
		// POPULATE MEDIA FIELD LABELS and GENRES and FILES
		var mediaMetaData = {};
		var mediaGenres = [];
		var mediaFiles = [];
		if (mediaType == 'movie') {
			mediaMetaData = {
				"www":"IMDB",
				"filename":"Filename",
				"runtime":"Runtime",
				"creators1":"Director",
				"creators2":"Screenwriter(s)",
				"creators3":"Cast",
				"taxonomy":"Genre",
				"company":"Company",
				"collection":"Series Title",
				"ratings":"Rotten Tomatoes ID"
			}
			mediaGenres = ['action','comedy','drama', 'adventure', 'documentary', 'horror', 'musical', 'sci-fi', 'western', 'other'];
			mediaFiles = ['poster', 'poster Frame', 'trailer'];
		} else if (mediaType == 'music') {
			mediaMetaData = {
				"www":"",
				"filename":"Track 1 Filename",
				"runtime":"Runtime",
				"creators1":"Artist",
				"creators2":"",
				"creators3":"",
				"taxonomy":"Genre",
				"company":"Company",
				"collection":"Album Title",
				"ratings":""
			}
			mediaGenres = ['Rock','Jazz','Smooth Jazz','Country','Classical','Punk','Raggae','R &amp; B','Hip Hop','Rap','Alternative','Blues','Easy Listening','Pop','Reggae','Ska','Electronic','Country','A capella','Metal','Industrial', 'Orchestra','Blues','Brazilian Funk','Religious','Noise','Other'];
			mediaFiles = ['cover Art'];
		} else if (mediaType == 'podcast') {
			mediaMetaData = {
				"www":"Soundcloud",
				"filename":"Filename",
				"runtime":"Runtime",
				"creators1":"Host(s)",
				"creators2":"Co-Host(s)",
				"creators3":"Guest(s)",
				"taxonomy":"Genre",
				"company":"Company",
				"collection":"Series Title",
				"ratings":""
			}
			mediaGenres = ['arts','comedy','education','games &amp; hobbies','health','music','news &amp; politics','religion &amp; spirituality','science','society &amp; culture','sports &amp; recreation','technology','business','tv &amp; film','other'];
			mediaFiles = ['cover Art'];
		} else if (mediaType == 'video') {
			mediaMetaData = {
				"www":"YouTube",
				"filename":"Filename",
				"runtime":"Runtime",
				"creators1":"Creator",
				"creators2":"",
				"creators3":"",
				"taxonomy":"Genre",
				"company":"Company",
				"collection":"Series Title",
				"ratings":""
			}
			mediaGenres = ['Comedy','Education','Entertainment','Film &amp; Animation','Gaming','Howto &amp; Style','Music','News &amp; Politics','Nonprofits &amp; Activism','People &amp; Blogs','Pets &amp; Animals','Science &amp; Technology','Sports','Travel &amp; Events','Other'];
			mediaFiles = ['poster Frame'];
		} else if (mediaType == 'book') {
			mediaMetaData = {
				"www":"",
				"filename":"Filename",
				"runtime":"",
				"creators1":"Author",
				"creators2":"Editor(s)",
				"creators3":"",
				"taxonomy":"Genre",
				"company":"Company",
				"collection":"Series Title",
				"ratings":""
			}
			mediaGenres = ['classic','graphic novel','technology','whitepaper','crime','fable','fairy tale','fanfiction','fantasy','folklore','historical fiction','horror','humor','legend','magical realistm','metafiction','mystery','mythology','poetry','realistic fiction','science fiction','short story','suspense/Thriller','tall tale','western','other'];
			mediaFiles = ['cover Art'];
		} else if (mediaType == 'thing') {
			mediaMetaData = {
				"www":"",
				"filename":"Filename",
				"runtime":"",
				"creators1":"Creator",
				"creators2":"Contributors",
				"creators3":"",
				"taxonomy":"Category",
				"company":"Company",
				"collection":"Collection",
				"ratings":""
			}
			mediaFiles = ['cover Art'];
		} else if (mediaType == 'recipe') {
			mediaMetaData = {
				"www":"",
				"filename":"Filename",
				"runtime":"Number of Servings",
				"creators1":"Chef",
				"creators2":"",
				"creators3":"",
				"taxonomy":"Cuisine",
				"company":"",
				"collection":"Collection",
				"ratings":""
			}
			mediaGenres = ['African','Asian','Cajun','Canadian','Caribbean','Central American','Eastern European','European','French','German','Greek','Indian','Italian','Japanese','Jewish','Mediterranean','Mexican','Middle Eastern','North American','Oceania','Polish','Scandinavian','South American','Southern','Southwestern','Thai'];
			mediaFiles = ['cover Art'];
		}
		for (var key in mediaMetaData) {
			var obj = mediaMetaData[key];
			if (obj == '') {
				$(document.getElementById('media-meta-'+key)).parents('.toggle-wrapper').hide();
			} else {
				$(document.getElementById('media-meta-'+key)).parents('.toggle-wrapper').show();
				document.getElementById('media-meta-'+key).innerHTML = obj;
			}
			if (mediaMetaData['www'] == '') {
				$(document.getElementById('autofill-wrapper')).hide();
			} else {
				$(document.getElementById('autofill-wrapper')).show();
			}
		}
		if (mediaGenres.length > 0) {
			$('#media-genre-select option').remove();
			$('#media-genre-select').append('<option value=""></option>');
			for (var i = 0; i < mediaGenres.length; i++) {
				$('#media-genre-select').append('<option value="'+mediaGenres[i]+'">'+mediaGenres[i].charAt(0).toUpperCase() + mediaGenres[i].slice(1)+'</option>');
			}
			document.getElementById('media-genre-wrap').style.display = 'table-cell';
		} else {
			document.getElementById('media-genre-wrap').style.display = 'none';
		}
		if (mediaFiles.length > 0) {
			$('#extra-files .row').remove();
			for (var i = 0; i < mediaFiles.length; i++) {
				$('#extra-files').append('<div class="row full"><div class="col"><div class="input-container"><label><span id="media-meta-'+mediaFiles[i]+'">'+mediaFiles[i].charAt(0).toUpperCase()+mediaFiles[i].slice(1)+' Filename</span></label><input type="text" name="'+mediaFiles[i].replace(' ','')+'" id="addMedia-'+mediaFiles[i].replace(' ','')+'" /></div></div></div>');
			}
		}
		if (mediaType == 'music') {
			$('#extra-files').append('<div class="row full repeater"><div class="col"><div class="input-container"><label><span id="media-meta-track02">Track 02 Filename</span></label><input type="text" name="track02" id="addMedia-track02" /><a class="add-remove" onclick="repeaterFields(this);">+</span></div></div></div>');
		}
		$('fieldset#new-media-meta').show();
	} else {
		$('#newMedia-info .left').fadeOut(fadeTimer);
		$('#newMedia-info .pull-right').fadeOut(fadeTimer);
	}
	resizeTabs(true);
}

// REPEATER FIELDS
function repeaterFields(obj) {
	if ($(obj).text() == '+') {
		$(obj).text('');
		var rowCount = $(obj).closest('.repeater').index() + 2;
		if (rowCount < 10) {
			rowCount = '0'+rowCount;
		}
		var newRow = '<div class="row full repeater"><div class="col"><div class="input-container"><label><span id="media-meta-track'+rowCount+'">Track '+rowCount+' Filename</span></label><input type="text" name="track'+rowCount+'" id="addMedia-track'+rowCount+'" /><a class="add-remove" onclick="repeaterFields(this);">+</span></div></div></div>';
		$(obj).closest('.repeater').after(newRow);
		resizeTabs(false);
	} else {
		
	}
/*
	if($(obj).closest('.repeater').index() > $(obj).closest('.repeater').siblings('.repeater').length) {		
	}
*/
}

// SUBMIT MEDIA TO BLOCKCHAIN
function postMedia(tipAlexandria) {
	var reqCheck = mediaReqCheck();
	if (reqCheck == true) {
		var tipToAlexandria = 0;
		if (tipAlexandria == 1) {
			tipToAlexandria = document.getElementById('alexandria-tip-amount').value;;
		}
		var Tid = document.getElementById('btih-hash').value;
		var FLOadd = document.getElementById('newMediaPublisherFLO').value;
		var pubTime = Date.parse(new Date()).toString();
		var sigQueryString = '{ "address":"'+ FLOadd +'", "text":"'+ Tid + '-' + FLOadd + '-' + pubTime +'" }';
		console.log(sigQueryString);
		var signature;
		var stopError = 0;
		$.ajax({
		    url: 'http://'+ serverAddress +':41289/alexandria/v1/sign',
		    type: 'POST',
			data: sigQueryString.toString(),
		    success: function(e) {
				var res = $.parseJSON(e);
				if (res['status'] == 'failure') {
					alert(res['response'][0]);
					stopError = 1;
				} else {
					signature = res['response'][0];
				}
		    }, 
			error: function (xhr, ajaxOptions, thrownError) {
				console.error(xhr.status);
				console.error(thrownError);
			},
			async:   false
		});
		if (stopError == 1) {
			signature = false;
		}		

		console.info(signature);
		if (signature == false) {
			return false;
		}
		var mediaType = $('#media-type-select-list a.active').attr('value');
		var mediaDesc = replace(replace(document.getElementById('addMedia-desc').value,'\r',' '),'\n',' ');
		var mediaInfo = '';
		$('#new-media-meta input[type="text"].info-field').each(function(){
			if ( $(this).val() != '' ) {
				var infoKeyName = $(this).attr('name');
				var infoKeyValue = $(this).val();
				if ((infoKeyValue) && (isNaN(infoKeyValue))){
					infoKeyValue = '"'+ infoKeyValue+'"';
				}
				if (mediaInfo == '') {
					mediaInfo = '"' + infoKeyName + '":'+ infoKeyValue +'';
				} else {
					mediaInfo = mediaInfo + ',' + '"' + infoKeyName + '":'+ infoKeyValue +'';
				}
			}
		});
		mediaInfo = mediaInfo + ',' + '"description":"'+ mediaDesc +'"';
	
		var mediaExtraInfo = '';
		$('#newMedia-info input[type="text"]').not('.info-field').each(function(){
			if ( $(this).val() != '' ) {
				var infoKeyName = $(this).attr('name');
				var infoKeyValue = $(this).val();
				if (infoKeyName == 'runtime'){
					if ((infoKeyValue) && (infoKeyValue.split(':'))){
						if (infoKeyValue.split(':').length != 0){
							infoKeyValue = calcSeconds(infoKeyValue);
						} else {
							alert('Please enter a valid runtime');
							return false;
						}
					}
					} else if ((infoKeyValue) && (isNaN(infoKeyValue))){
					infoKeyValue = '"'+ infoKeyValue+'"';
				}
				if (mediaExtraInfo == '') {
					mediaExtraInfo = '"' + infoKeyName + '":'+ infoKeyValue +'';
				} else {
					mediaExtraInfo = mediaExtraInfo + ',' + '"' + infoKeyName + '":'+ infoKeyValue +'';
				}
			}
		});

		if ($('#payment-pwyw:checked').length != 0) {
			var payAmount = [];
			$('.pwyw-amount-value').each(function(){
				var pwywAmount = $(this).val()*100;
				payAmount.push(pwywAmount);
			});
			if (mediaExtraInfo == '') {
				mediaExtraInfo = '"pwyw":"'+ payAmount +'"';
			} else {
				mediaExtraInfo = mediaExtraInfo + ',' + '"pwyw":"'+ payAmount +'"';
			}
		}

		if (mediaExtraInfo != '') {
			mediaInfo = mediaInfo+', "extra-info": {'+mediaExtraInfo+'}';
		}
		
		if ($('#payment-tips:checked').length != 0) {
			var payCurrency = 'USD';
			var payType = 'tip';
			var payAmount = [];
			$('.tip-amount-value').each(function(){
				var tipAmount = $(this).val()*100;
				payAmount.push(tipAmount);
			});
			var queryString = '{ "alexandria-media": { "torrent": "'+ Tid +'", "publisher": "'+ FLOadd +'", "timestamp":'+ pubTime +', "type": "'+ mediaType +'", "payment": { "currency":"'+ payCurrency +'", "type": "'+ payType +'", "amount": "'+ payAmount +'"}, "info": {'+mediaInfo+'} }, "signature":"'+ signature +'" }';
		} else {
			var queryString = '{ "alexandria-media": { "torrent": "'+ Tid +'", "publisher": "'+ FLOadd +'", "timestamp":'+ pubTime +', "type": "'+ mediaType +'", "info": {'+mediaInfo+'} }, "signature":"'+ signature +'" }';
		}
		console.log(queryString);
		var FLOAccount = $('#newMediaPublisherFLO option:selected').html();
		if (window.confirm('Publish Artifact using '+ FLOAccount +' : '+ FLOadd +'?')) { 
			$.ajax({
			    url: 'http://'+ serverAddress +':41289/alexandria/v1/send',
			    type: 'POST',
				data: queryString.toString(),
			    success: function(e) {
					hideOverlay();		    	
			    	$('.sharing-ui').hide();
			    	resetAlexandria();
			    	$('#add-media input[type="text"]').val('');
			    	$('#add-media textarea').val('');
			    	alertModal(publishedArtifactSVG+'<br /> Artifact Published!');
			    },
				error: function (xhr, ajaxOptions, thrownError) {
					console.error(xhr.status);
					console.error(thrownError);
				}
			});
		}
	}
}

/* ADD NEW CONTENT INTERFACE */
function resizeTabs(scroll, t) {
	if (t) {		
		var tabsTimeout = setTimeout(function() {
			resizeTabs();
		}, t);
		return false;
	}
	$('.media-info-container').css('overflow','hidden');
	var tabHeight = $('.modal-tab:visible').children().first().height();
	$('.modal-tab:visible').children().each(function(){
		var thisTabHeight = $(this).height();
		if (thisTabHeight > tabHeight) {
			tabHeight = thisTabHeight;
		}
	});
	$('.media-info-container').css('overflow','initial');
	$('#newMedia-tabs').css('height',tabHeight+'px');
	if (scroll) {
		var tabsTimeout = setTimeout(function() {
			window.scrollTo(0, $('#newMedia-info .left').position().top);
		}, fadeTimer);
	}	
}

// ALERT MODAL
function alertModal(alertText) {
	var modalHTML = '<p>' + alertText + '</p><div><a onclick="hideOverlay()" class="btnLightGray">OK</a></div>';
	
	document.getElementById('alert-modal').innerHTML = modalHTML;
	if ( (document.getElementById('alert-modal').style.display == 'none') || (document.getElementById('alert-modal').style.display == '') ) {
		document.getElementById('alert-modal').style.display = 'block';
		document.getElementById('app-overlay').style.display = 'block';
	} else {
		hideOverlay();
	}
}

// GO MODAL
function showGoModal() {
	document.getElementById('user-modal').style.display = 'none';
	if ( (document.getElementById('go-modal').style.display == 'none') || (document.getElementById('go-modal').style.display == '') ) {
		document.getElementById('go-modal').style.display = 'block';
		document.getElementById('app-overlay').style.display = 'block';
	} else {
		hideOverlay();
	}
	document.getElementById('go-to-input').focus();
}

function goToLocation() {
	var goLocation = document.getElementById('go-to-input').value;
	if (goLocation.split('#').length > 1) {
		goLocation = goLocation.split('#')[1];
	} else if (goLocation.slice(0,1) != '/') {
		goLocation = '/'+goLocation;
	}
	var newUrl = location.href.slice(0,location.hash.length*-1) + '#' + goLocation;
	document.getElementById('go-to-input').value = '';
	router(event, newUrl);
}

// LOAD ABOUT VIEW
function loadAboutView() {
	hideOverlay();
	resetInterface();
	$('main').not('#about').hide();
	$('.wallet-ui').hide();
	$('.publisher-ui').hide();
	$('.sharing-ui').hide();
	$('.view-media-ui').hide();
	$('.view-publishers-ui').hide();
	document.getElementById('search').style.display = 'block';
	document.getElementById('about').style.display = 'block';
	$('#about #video-embed video').remove();
	$('#about #video-embed').append('<video controls="controls" poster="https://i.ytimg.com/vi/z_u-ndscZjY/hqdefault.jpg"><source src="http://' + IPFSserver +'/ipfs/QmUbsjbjkRu41JqiyAhq61inUpDSB8uMHsTkdtbHg2jYmv/" type="video/mp4"></video>');
	var stateObj = {
		currentView: 'about'
	}
	makeHistory(stateObj, 'ΛLΞXΛNDRIΛ');
}

// LOAD WALLET VIEW
function loadWalletView() {
	$('main').not('#wallet').hide();
	$('.publisher-ui').hide();
	$('.sharing-ui').hide();
	$('.view-media-ui').hide();
	$('.view-publishers-ui').hide();
	hideOverlay();
	resetInterface();
	document.getElementById('search').style.display = 'none';
	$('.wallet-ui').show();
	document.getElementById('wallet-view').style.display = 'block';
	var stateObj = {
		currentView: 'wallet'
	}
	makeHistory(stateObj, 'ΛLΞXΛNDRIΛ Wallet');
	if ( (FLOauth.length == 0) && (!wallet) ) {
			document.getElementById('wallet-user').value = '';
			document.getElementById('wallet-token').value = '';	
			if (location.protocol == 'app:') {
				document.getElementById('wallet-connect-currency').innerHTML = 'Florincoin';
				$('#wallet-connect-btn').attr('onclick','connectWallet(this, "FLO")');
				$('#wallet-user').attr('placeholder','Username');
			} else {
				document.getElementById('wallet-connect-currency').innerHTML = 'FloVault';
				$('#wallet-connect-btn').attr('onclick','connectWallet(this, "FloVault")');
				$('#wallet-user').attr('placeholder','Identifier');
				$('#refreshBalance').attr('onclick','updateAddressList();');
				$("#newAddressBtn").attr('onclick','newFloVaultAddress()');
				$("#sendFloBtn").attr('onclick','sendFloVault()');
			}
			$('#wallet-auth-modal').fadeIn(fadeTimer);
			document.getElementById('app-overlay').style.display = 'block';
	}
}

// RPC CONNECT TO FLORINCOIN WALLET
var FLOclient = {};
var FLOauth = [];
function connectWallet(obj, wallet) {
	if ($(obj).hasClass('disabled')) {
		return false;
	}
	$(obj).addClass('disabled');
	if (wallet == 'FLO') {
		FLOauth.length = 0;
		FLOauth.push(document.getElementById('wallet-user').value);
		FLOauth.push(document.getElementById('wallet-token').value);
		FLOclient = new bitcoin.Client({
		  host: 'localhost',
		  port: 18322,
		  user: FLOauth[0],
		  pass: FLOauth[1],
		  timeout: 30000
		});
		hideOverlay();
		getBalance(obj, FLOclient);
	} else if (wallet == 'BTC') {
		BTCauth.length = 0;
		BTCauth.push(document.getElementById('wallet-user').value);
		BTCauth.push(document.getElementById('wallet-token').value);
		BTCclient = new bitcoin.Client({
		  host: 'localhost',
		  port: 18222,
		  user: BTCauth[0],
		  pass: BTCauth[1],
		  timeout: 30000
		});
		hideOverlay();
	} else if (wallet == 'FloVault') {
		FloVaultIdentify();
	}
}

// RPC CONNECT TO BITCOIN WALLET
var BTCclient = {};
var BTCauth = [];
function connectBTCWallet(obj) {
	if ($(obj).hasClass('disabled')) {
		return false;
	}
	$(obj).addClass('disabled');
	BTCauth.length = 0;
	BTCauth.push('username');
	BTCauth.push('strongpassword');
	BTCclient = new bitcoin.Client({
	  host: 'localhost',
	  port: 18222,
	  user: BTCauth[0],
	  pass: BTCauth[1],
	  timeout: 30000
	});
	BTCclient.cmd('getbalance', '*', 6, function(err, balance, resHeaders){
		if (err) {
			if (err.code == '-32602') {
				alert('Incorrect Username or Password');
			}
			console.log(err);
			BTCauth.length = [];
			if (obj) {
				$(obj).removeClass('disabled');
			}
		} else {
			console.info(BTCauth);
			console.info(balance);
		}
	});
}

// RPC WALLET BALANCE
function getBalance(obj, client) {
	document.getElementById('wallet-balance-flo').innerHTML = '';
	document.getElementById('wallet-balance-amount').innerHTML = 'Updating ...'
/*
	$.ajax({
		url: 'http://'+serverAddress+':41289/alexandria/v1/wallet/getbalance',
		success: function (e) {
			var data = $.parseJSON(e);
			console.info(data);
			document.getElementById('wallet-balance-flo').innerHTML = data + ' FLO';
			document.getElementById('wallet-balance-amount').innerHTML = '$'+Math.round((data*FLOUSD)*100)/100;
			hideOverlay();
			if (document.getElementById('wallet-address-select').options.length < 1) {
//				getWalletAccts(client);
			}
			if (obj) {
				$(obj).removeClass('disabled');
			}
		},
		error: function (xhr, ajaxOptions, thrownError) {
			console.error(xhr.status);
			console.error(thrownError);
			FLOauth.length = [];
			BTCauth.length = [];
			if (obj) {
				$(obj).removeClass('disabled');
			}
		}
	});
*/	
	client.cmd('getbalance', '*', 6, function(err, balance, resHeaders){
		if (err) {
			if (err.code == '-32602') {
				alert('Incorrect Username or Password');
			}
			console.log(err);
			FLOauth.length = [];
			BTCauth.length = [];
			if (obj) {
				$(obj).removeClass('disabled');
			}
		} else {
			document.getElementById('wallet-balance-flo').innerHTML = balance + ' FLO';
			document.getElementById('wallet-balance-amount').innerHTML = '$'+Math.round((balance*FLOUSD)*100)/100;
			hideOverlay();
			if (document.getElementById('wallet-address-select').options.length < 1) {
				getWalletAccts(client);
			}
			if (obj) {
				$(obj).removeClass('disabled');
			}
		}
	});
}

// RPC WALLET ACCOUNTS
var walletAccts = [];
var addressCount = 0;
function getWalletAccts(client) {
	walletAccts = [];
	$('#newAddressBtn').addClass('disabled');
	client.cmd('listaccounts', function(err, accounts, resHeaders){
		if (err) {
			console.log(err);
		} else {
			console.info(accounts);
			for (var account in accounts) {
//				if (account != '') {
					walletAccts.push(account);
//				}
			}
			console.info(walletAccts);
			console.info(walletAccts.length);
			document.getElementById('wallet-address-select').innerHTML = '<option value="">Select Address</option>';
			document.getElementById('newPublisher-floAdd').innerHTML = '<option value="">Select Address</option>';
			document.getElementById('newMediaPublisherFLO').innerHTML = '<option value="">Select Address</option>';
			getWalletAddresses(client);
		}
	});
}

// RPC WALLET ADDRESSES
function getWalletAddresses(client) {
	console.info(walletAccts);
	for (var i = 0; i < walletAccts.length; i++) {
		console.log(i);
		client.cmd('getaddressesbyaccount', walletAccts[i], function(err, address, resHeaders){
			console.log(addressCount);
			console.info(walletAccts[addressCount]);
			console.info(address);
			var acctLabel = walletAccts[addressCount];
			for (var a = 0; a < address.length; a++) {
				document.getElementById('wallet-address-select').innerHTML = document.getElementById('wallet-address-select').innerHTML + '<option value="'+address[a]+'">' + address[a] +'</option>';
				document.getElementById('newPublisher-floAdd').innerHTML = document.getElementById('newPublisher-floAdd').innerHTML + '<option value="'+address[a]+'">' + address[a] +'</option>';
				document.getElementById('newMediaPublisherFLO').innerHTML = document.getElementById('newMediaPublisherFLO').innerHTML + '<option value="'+address[a]+'">' + address[a] +'</option>';
			}
			addressCount++;
		});
	}
	var selectInterval = setInterval(function() {
	    if (document.getElementById('wallet-address-select').length > 1) {
	        clearInterval(selectInterval);
			document.getElementById('wallet-address-select').removeAttribute('disabled');
			document.getElementById('newPublisher-floAdd').removeAttribute('disabled');
			document.getElementById('newMediaPublisherFLO').removeAttribute('disabled');
			$('#newAddressBtn').removeClass('disabled');
	    }
	}, 100);

}

// WALLET ADDRESS RECEIVE QR CODE
function receiveQR(obj) {
	var publisherAddress = $(obj).find('option:selected').val();
	generateQR(publisherAddress, 'wallet-receive-qrcode', 100, 100, 'florincoin');
}

// FLO QR CODE
function generateQR(address, wrapper, qrw, qrh, wallet) {
	var qrWrap = document.getElementById(wrapper);
	qrWrap.innerHTML = '';
	qrWrap.setAttribute('onclick','loadQR('+wallet+':'+address+')');
	var qrcode = new QRCode(wrapper, {
		text: wallet+':'+address,
		width: qrw,
		height: qrh,
		colorDark : "#000000",
		colorLight : "#FFFFFF",
		correctLevel : QRCode.CorrectLevel.H
	});
}

// NEW ADDRESS MODAL
function displayNewAddModal() {
	$('#new-address-modal').fadeIn(fadeTimer);
	document.getElementById('app-overlay').style.display = 'block';
}

// RPC GENERATE NEW FLORINCOIN ADDRESS
function newFloAddress(obj, client) {
	console.info(client);
	if ($(obj).hasClass('disabled')) {
		return false;
	}
	$(obj).addClass('disabled');
	FLOclient.cmd('getnewaddress', document.getElementById('flo-address-label').value, function(err, address, resHeaders){
		if (err) {
			console.log(err);
			$(obj).removeClass('disabled');
		} else {
			document.getElementById('wallet-address-select').innerHTML = document.getElementById('wallet-address-select').innerHTML + '<option value="'+address+'">' + address +'</option>';
			hideOverlay();
			document.getElementById('wallet-address-select').selectedIndex = document.getElementById('wallet-address-select').options.length -1;
			generateQR(address, 'wallet-receive-qrcode', 64, 64, 'florincoin')
			$(obj).removeClass('disabled');
		}
	});	
}

// RPC SEND FLO
function sendFLO(obj) {
	if ($(obj).hasClass('disabled')) {
		return false;
	}
	if (document.getElementById('wallet-send-address').value == '') {
		alert('Input a receiving FLO address');
		return false;
	}
	var sendAmt = parseFloat(document.getElementById('wallet-send-amount-flo').value);
	sendAmt = Math.round(sendAmt*100000000)/100000000;
	if ( (!sendAmt) || ( (sendAmt) && (isNaN(sendAmt) == true) ) ) {
		alert('Input a valid send amount');
		return false;
	}
	$(obj).addClass('disabled');
	console.log(sendAmt);
	if (window.confirm('Send '+ sendAmt + ' FLO to ' + document.getElementById('wallet-send-address').value + '?')) { 
		FLOclient.cmd('sendtoaddress', document.getElementById('wallet-send-address').value, sendAmt, document.getElementById('wallet-send-message').value, function(err, txid, resHeaders){
			if (err) {
				console.log(err);
				$(obj).removeClass('disabled');
			} else {
				alert(parseFloat(document.getElementById('wallet-send-amount-flo').value) + ' FLO Sent: TxId ' + txid);
				$(obj).removeClass('disabled');
				document.getElementById('wallet-send-address').value = '';
				document.getElementById('wallet-send-amount').value = '';
				document.getElementById('wallet-send-amount-flo').value = '';
				document.getElementById('wallet-send-message').value = '';
				getBalance(obj, FLOclient);
			}
		});	
	} else {
		$(obj).removeClass('disabled');
	}
}

// LOAD ALEXANDRIA
function loadAlexandria() {
	if (window.location.search.indexOf("view") == -1) {
		$('#search').show();
	}
	$('#adv-search').addClass('abs');
	$('.header-modal').addClass('abs');
	$('.info-modal').addClass('abs');
	$('.bubble-modal').addClass('abs');
}

// RESET INTERFACE
function resetInterface() {
	// Reset Interface
	$('video').trigger('pause');
	document.getElementById('tip-comment').value = '';
	document.getElementById('viewlabel').style.display = 'none';
	document.getElementById('disabler').style.display = 'none';
	if (document.getElementById('intro').style.display == 'block') {
		$('#intro').fadeOut(fadeTimer);
	}
	$('#browse-media h2').remove();
	$('.search').attr('disabled',false);
	$('body').append($('#info-modal-media'));
	$('#browse-media-wrap .row').remove();
	document.getElementById('share-modal').style.display = 'none';
	document.getElementById('tip-modal').style.display = 'none';
	$('#share-modal').css({
			left:'initial',
			right:'initial'
		}).hide();
	$('#tip-modal').css({
			'left':'initial',
			'right':'initial'
		}).hide();
	if (document.getElementById('user-modal').style.display == 'block') {
		$('#user-modal').fadeOut(fadeTimer);
	}
}

// RESET ALEXANDRIA
function resetAlexandria() {
	$('video').trigger('pause');
	$('audio').trigger('pause');
	$('main').not('#browse-media').hide();
	document.getElementById('search-main').value = '';
	$('#browse-media .module-links a.active').removeClass('active');
	hideOverlay();
	$('body').append($('#info-modal-media'));
	$('#browse-media-wrap .row').remove();
	document.getElementById('search').style.display = 'block';
	$('#share-modal').css({
			left:'initial',
			right:'initial'
		}).hide();
	$('#tip-modal').css({
			'left':'initial',
			'right':'initial'
		}).hide();
	$('.wallet-ui').hide();
	$('.publisher-ui').hide();
	$('.sharing-ui').hide();
	$('.view-publishers-ui').hide();
	$('.view-media-ui').show();
	document.getElementById('search').style.display = 'block';
	$('#app-shading').css('bottom','0');
	filterMediaByType('', true);
}

// CLEAR MODAL
function clearModal() {
	$('.overlay').fadeOut(fadeTimer);
	return false;
}

// QUIT
function closeWindow() { 
	gui.App.quit();
} 

// LIGHTBOX
function lightbox(obj){
	var imgContent = $(obj).find('img').clone();
	$('#lightbox').children().remove();
	$('#lightbox').append(imgContent);
	$('#lightbox').show();
	var imgContentWidth = $(imgContent).width();
	var maxWH = .95; // Max width and height for lightboxed image
	if (imgContentWidth > window.innerWidth*maxWH) {
		$('#lightbox img').css('width',window.innerWidth*maxWH+'px');
		imgContentWidth = $('#lightbox img').width();
	}
	var imgContentHeight = $('#lightbox img').height();
	if (imgContentHeight > window.innerHeight*maxWH) {
		$('#lightbox img').css('width','auto');
		$('#lightbox img').css('height',window.innerHeight*maxWH+'px');
		imgContentHeight = $('#lightbox img').height();
		imgContentWidth = $('#lightbox img').width();
	}
	$('#lightbox img').css({
		'top': (window.innerHeight-imgContentHeight)/2+'px',
		'left': (window.innerWidth-imgContentWidth)/2+'px'
	});
}

// LIGHTBOX FOR VIDEO
function lightboxVideo(obj) {
	var videoURL = $(obj).attr('data-source');
	var videoContent = '<video controls="controls" poster=""><source src="'+videoURL+'" type="video/mp4" /><param name="autoplay" value="true" /></video>'
	$('#lightbox').children().remove();
	$('#lightbox').append(videoContent);
	$('#lightbox video').css({
		'top': '100%',
		'left': '100%'
	});
	$('#lightbox').show();
	var lightboxInterval = setInterval(function() {
		if ($('#lightbox video').width() > 200) {
			var videoContentWidth = $('#lightbox video').width();
			console.info(videoContentWidth);
			var maxWH = .95; // Max width and height for lightboxed image
			if (videoContentWidth > window.innerWidth*maxWH) {
				$('#lightbox video').css('width',window.innerWidth*maxWH+'px');
				videoContentWidth = $('#lightbox video').width();
			}
			var videoContentHeight = $('#lightbox video').height();
			console.info(videoContentHeight);
			if (videoContentHeight > window.innerHeight*maxWH) {
				$('#lightbox video').css('width','auto');
				$('#lightbox video').css('height',window.innerHeight*maxWH+'px');
				videoContentHeight = $('#lightbox video').height();
				videoContentWidth = $('#lightbox video').width();
			}
			$('#lightbox video').css({
				'top': (window.innerHeight-videoContentHeight)/2+'px',
				'left': (window.innerWidth-videoContentWidth)/2+'px'
			});
		}
	}, 500);
}

// INT SORT
jQuery.fn.sortElements = (function(){
    var sort = [].sort;
    return function(comparator, getSortable) {
        getSortable = getSortable || function(){return this;};
        var placements = this.map(function(){
            var sortElement = getSortable.call(this),
                parentNode = sortElement.parentNode,
                // Since the element itself will change position, we have
                // to have some way of storing its original position in
                // the DOM. The easiest way is to have a 'flag' node:
                nextSibling = parentNode.insertBefore(
                    document.createTextNode(''),
                    sortElement.nextSibling
                ); 
            return function() {
                if (parentNode === this) {
                    throw new Error(
                        "You can't sort elements if any one is a descendant of another."
                    );
                }
                // Insert before flag:
                parentNode.insertBefore(this, nextSibling);
                // Remove flag:
                parentNode.removeChild(nextSibling);
            };
        });
        return sort.call(this, comparator).each(function(i){
            placements[i].call(getSortable.call(this));
        });
    };
})();

// ALPHA SORT
function sortUnorderedList(ul, sortDescending) {
	var mylist = $('#'+ul);
	var listitems = mylist.children('li').get();
	listitems.sort(function(a, b) {
	   return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
	})
	$.each(listitems, function(idx, itm) { mylist.append(itm); });
}

// TOGGLE BUTTON
function toggleBtn(obj) {
	$(obj).addClass('active');
	$(obj).siblings('.toggleBtn').removeClass('active');
}

// REPLACE .SVG WITH WEB SVG
function replaceSVG() {
	jQuery('img.makesvg').each(function(){
		var $img = jQuery(this);
		var imgID = $img.attr('id');
		var imgClass = $img.attr('class');
		var imgURL = $img.attr('src');
		jQuery.get(imgURL, function(data) {
			// Get the SVG tag, ignore the rest
			var $svg = jQuery(data).find('svg');
	
			// Add replaced image's ID to the new SVG
			if(typeof imgID !== 'undefined') {
				$svg = $svg.attr('id', imgID);
			}
			// Add replaced image's classes to the new SVG
			if(typeof imgClass !== 'undefined') {
				$svg = $svg.attr('class', imgClass+' replaced-svg');
			}
	
			// Remove any invalid XML tags as per http://validator.w3.org
			$svg = $svg.removeAttr('xmlns:a');
			
			// Replace image with new SVG
			$img.replaceWith($svg);

		}, 'xml');
	});
}

// SPINNER
var largeSpinConfig = {
	lines: 17, // The number of lines to draw
	length: 7, // The length of each line
	width: 1, // The line thickness
	radius: 10, // The radius of the inner circle
	corners: 1, // Corner roundness (0..1)
	rotate: 0, // The rotation offset
	direction: 1, // 1: clockwise, -1: counterclockwise
	color: '#000', // #rgb or #rrggbb or array of colors
	speed: .5, // Rounds per second
	trail: 34, // Afterglow percentage
	shadow: false, // Whether to render a shadow
	hwaccel: false, // Whether to use hardware acceleration
	className: 'spinner', // The CSS class to assign to the spinner
	zIndex: 2e9, // The z-index (defaults to 2000000000)
	top: '50%', // Top position relative to parent
	left: '50%' // Left position relative to parent
};
var target = document.getElementById('wait');
var spinner = new Spinner(largeSpinConfig).spin(target);

// DEFAULT BROWSER FONT SIZE
document.emSize=function(pa){
	pa= pa || document.body;
	var who= document.createElement('div');
	var atts= {fontSize:'1em',padding:'0',position:'absolute',lineHeight:'1',visibility:'hidden'};
	for(var p in atts){
		who.style[p]= atts[p];
	}
	who.appendChild(document.createTextNode('M'));
	pa.appendChild(who);
	var fs= [who.offsetWidth,who.offsetHeight];
	pa.removeChild(who);
	return fs;
}

// TRIM SPACES FROM STR
function trim11(str) {
    str = str.replace(/^\s+/, '');
    for (var i = str.length - 1; i >= 0; i--) {
        if (/\S/.test(str.charAt(i))) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    return str;
}

// REPLACE CARRIAGE RETURNS IN STR
function replace(string,text,by) {
    var strLength = string.length, txtLength = text.length;
    if ((strLength == 0) || (txtLength == 0)) return string;
    var i = string.indexOf(text);
    if ((!i) && (text != string.substring(0,txtLength))) return string;
    if (i == -1) return string;
    var newstr = string.substring(0,i) + by;
    if (i+txtLength < strLength)
        newstr += replace(string.substring(i+txtLength,strLength),text,by);
    return newstr;
}

// SELECT TEXT ON SINGLE CLICK
function selectText(containerid) {
	if (document.selection) {
	    var range = document.body.createTextRange();
	    range.moveToElementText(document.getElementById(containerid));
	    range.select();
	} else if (window.getSelection) {
	    var range = document.createRange();
	    range.selectNode(document.getElementById(containerid));
	    window.getSelection().addRange(range);
	}
}

// COPY FOLDER and FILES
function copyArtifact(source, target) {
	fs.copy(source, target, function (err) {
	  if (err) {
	    console.error(err);
	  } else {
	    console.log("success!");
	  }
	}); //copies directory, even if it has subdirectories or files}
}

// CHECK LOCAL CONNECTIONS

/*
function checkConnection() {
	var url = 'http://localhost:3000/stream/08D72B48F0799BBF62A2DC54CB66CB1ED14F9431/bitcoin.pdf';
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404;
}
*/

// GO BACK
function goBack() {
	$('video').trigger('pause');
	$('audio').trigger('pause');
	navCounter--;
	history.back();
}

// MAKE HISTORY AND LOCATION
function makeHistory(stateObj, newTitle) {
	console.info(stateObj);
	navCounter++;
	if ( ( (document.getElementById('browser-nav')) && (history.state) && (history.state.isFront) ) || (navCounter == 1) ) {
		$('#browser-nav').remove();
	} else {
		resetInterface();
		if (!document.getElementById('browser-nav')) {
			$('#logo').after('<div id="browser-nav" class="nodrag"><a onclick="goBack()">Back</a></div>');
		}
	}
	$('#viewlabel').children().hide();
	console.log('Make History!');
	var newUrl = (stateObj.currentView != 'front') ? (document.location.origin + document.location.pathname+'#') : (document.location.origin + document.location.pathname);
	var newBreadcrumbs = '';
	if ( (stateObj.currentView != 'front') && (stateObj.currentView.slice(0,3) != 'add') ) {
		if (stateObj.module) {
			var callFunction = (stateObj.module == 'media') ? ('filterMediaByType(&apos;&apos;, true)') : ('getAllPublishers()') ;
			newBreadcrumbs = (stateObj.module == 'publisher') ? (newBreadcrumbs + ' / <a onclick="'+ callFunction +';" class="currentView-breadcrumb">'+stateObj.module.charAt(0).toUpperCase() + stateObj.module.slice(1) + 's'+'</a>') : (newBreadcrumbs + ' / <a onclick="'+ callFunction +';" class="currentView-breadcrumb">'+stateObj.module.charAt(0).toUpperCase() + stateObj.module.slice(1)+'</a>');
			newUrl = (stateObj.module == 'publisher') ? (newUrl + '/'+stateObj.module + 's') : (newUrl + '/' + stateObj.module);
		}
		if (!stateObj.subView) {
			if (stateObj.currentView == 'media') {
				newBreadcrumbs = newBreadcrumbs + ' / <a onclick="setMediaTypeFilter(&apos;&apos;,true);" class="currentView-breadcrumb">'+ stateObj.currentView +'</a>';
			} else if (stateObj.currentView == 'search') {
				newBreadcrumbs = (stateObj.searchOn) ? (newBreadcrumbs + ' / <a onclick="searchByField(&apos;media&apos;, &apos;*&apos;,&apos;'+stateObj.searchTerm+'&apos;);" class="currentView-breadcrumb">'+ stateObj.currentView +'</a>') : (newBreadcrumbs + ' / <a onclick="setMediaTypeFilter(&apos;&apos;,true);" class="currentView-breadcrumb">'+ stateObj.currentView +'</a>');
			}
			newUrl = newUrl + '/' + stateObj.currentView;
		}
	}
	if ( (stateObj.mediaTypes) && (stateObj.mediaTypes[0]) && (stateObj.mediaTypes.length > 0) ) {
		var breadString = '';
		var urlString = '';
		for (var i = 0; i < stateObj.mediaTypes.length; i++) {
			var mediaTypeStr = (stateObj.mediaTypes[i] != 'music') ? (stateObj.mediaTypes[i].charAt(0).toUpperCase() + stateObj.mediaTypes[i].slice(1) + 's') : (stateObj.mediaTypes[i].charAt(0).toUpperCase() + stateObj.mediaTypes[i].slice(1));
			breadString = (breadString == '') ? (mediaTypeStr) : (breadString + ' + ' + mediaTypeStr);
			urlString = (urlString == '') ? ('type/'+stateObj.mediaTypes[i]) : (urlString + '-' + stateObj.mediaTypes[i]);
		}
		newBreadcrumbs = newBreadcrumbs + ' / ' + breadString;
		newUrl = newUrl + '/' + urlString;
	}
	if (stateObj.searchTerm) {
		newBreadcrumbs = ((!stateObj.searchOn) || (stateObj.searchOn == '*')) ? (newBreadcrumbs + ' / ' + stateObj.searchTerm) : (newBreadcrumbs + ' / <span id="breadcrumbs-searchOn">' + stateObj.searchOn + '</span> / ' + stateObj.searchTerm);
		newUrl = ((!stateObj.searchOn) || (stateObj.searchOn == '*')) ? (newUrl + '/' + stateObj.searchTerm.toString().toLowerCase().replace(" ","-")) : (newUrl + '/' + stateObj.searchOn + '/' + stateObj.searchTerm.toString().toLowerCase().replace(" ","-"));
	} else if (stateObj.subView) {
		if (stateObj.artifactTitle) {
			newBreadcrumbs = newBreadcrumbs + ' / <a onclick="setMediaTypeFilter(&apos;&apos;,true);" class="currentView-breadcrumb">Media</a> / <a onclick="loadPublisherEntity(this)" id="publisher-'+ stateObj.publisherId +'">'+ stateObj.artifactPublisher +'</a> / <a onclick="filterMediaByType(&apos;'+stateObj.mediaType+'&apos;)">' + stateObj.mediaType.charAt(0).toUpperCase() + stateObj.mediaType.slice(1) + '</a> / ' + stateObj.artifactTitle;
		} else {
			newBreadcrumbs = newBreadcrumbs + ' / <a onclick="getAllPublishers()" class="currentView-breadcrumb">Publishers</a> / ' + stateObj.subView;
		}
		newUrl = newUrl + '/' + stateObj.subView;
	} else if (stateObj.currentView.slice(0,3) == 'add') {		
		newBreadcrumbArray = stateObj.currentView.split('-');
		var breadString = '';
		for (var i = 0; i < newBreadcrumbArray.length; i++) {
			breadString = (breadString == '') ? (newBreadcrumbArray[i].charAt(0).toUpperCase() + newBreadcrumbArray[i].slice(1)) : (breadString + ' ' + newBreadcrumbArray[i].charAt(0).toUpperCase() + newBreadcrumbArray[i].slice(1))
		}
		newBreadcrumbs = newBreadcrumbs + ' / ' + breadString;
		newUrl = newUrl + '/' + stateObj.currentView;		
	}
	if ( (newBreadcrumbs == '') && (stateObj.currentView != 'front') ) {
		newBreadcrumbs = newBreadcrumbs + ' / ' + stateObj.currentView.charAt(0).toUpperCase() + stateObj.currentView.slice(1);
		
	}
	document.getElementById('alexandria-breadcrumbs').innerHTML = newBreadcrumbs;
	document.getElementById('alexandria-breadcrumbs').style.display = 'inline-block';
	document.getElementById('viewlabel').style.display = 'inline-block';
	document.title = newTitle;
	history.pushState(stateObj, newTitle, newUrl);
}

// LOAD SCRIPT
function loadScript(url, callback)
{
    // Adding the script tag to the head as suggested before
    var body = document.getElementsByTagName('body')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    body.appendChild(script);
}

// FLOVAULT INIT
function FloVaultInit() {
	loadScript('/js/SimpleWallet.js', SimpleWallet_loaded);
}

function SimpleWallet_loaded() {
	console.log('SimpleWallet.js loaded');
	loadScript('/js/SimpleDeps.js', SimpleDeps_loaded);
};

function SimpleDeps_loaded() {
	console.log('SimpleDeps.js loaded');
};

// ToDo: No error cases are handled

var registerBtn = $("#registerButton");
var emailInput = $("#registerEmailInput");
var registerPassInput = $("#registerPassInput");
var registerOutput = $("#registerOutput");

var identifierInput = $("#wallet-user");
var identifierPassInput = $("#wallet-token");
var identifierOutput = $("#identifierOutput");

var refreshAddressButton = $("#refreshBalance");
var addressListOutput = $("#addressListOutput");

var sendFromInput = $("#wallet-address-select");
var sendToInput = $("#wallet-send-address");
var sendAmountInput = $("#wallet-send-amount-flo");
var sendOutput = $("#sendOutput");

// FLOVAULT REGISTER
registerBtn.click(function () {
    var data = {};
    if (emailInput.val().length > 3)
        data = {email: emailInput.val()};

    $.post("http://flovault.alexandria.io/wallet/create", data, function (response) {
        console.log("Create Response");
        console.log(response);
        registerOutput.text(JSON.stringify(response, null, 2));

        if (response.error) {
            console.error("Register failed :(");
            return;
        }

        identifierInput.val(response.identifier);

        wallet = new Wallet(response.identifier, identifierPassInput.val());
        wallet.setSharedKey(response.shared_key);
        wallet.store();
    });
});

// FLOVAULT LOAD WALLET
function FloVaultIdentify() {
	$.ajax({
		url: 'http://flovault.alexandria.io/wallet/checkload/' + identifierInput.val(),
		success: function(response) {
	         console.log("Check Load Response");
	         console.log(response);
	         identifierOutput.text(JSON.stringify(response, null, 2));
	
	         if (response.gauth_enabled) {
	             console.log("2FA unsupported");
	             alert("Sorry, 2FA is not supported at this time");
	             $('#wallet-connect-btn').removeClass('disabled');
	             return false;
	             // ToDo: add 2FA support, needs further research
	         }
	
	         wallet = new Wallet(response.identifier, identifierPassInput.val());
	         wallet.load(function () {
				console.log("Wallet Post-Load");
				identifierOutput.text(identifierOutput.text() + "\n\nWallet Balance: " + wallet.getTotalBalance());
				hideOverlay();
				updateAddressList();		
	         });
	     },
		error: function (xhr, ajaxOptions, thrownError) {
			console.error(xhr.status);
			console.error(thrownError);
		}
	});
}

// FLOVAULT LOAD ADDRESSES
var loadedAddresses;
function newFloVaultAddress() {
    wallet.generateAddress();
	loadedAddresses = document.getElementById('wallet-address-select').length - 1;
    updateAddressList();
}

// FLOVAULT REFRESH BALANCES
function refreshFloVaultBalances() {
    wallet.refreshBalances();
    updateAddressList();
}

// FLOVAULT UPDATE ADDRESS LIST
function updateAddressList() {
	document.getElementById('wallet-balance-amount').innerHTML = 'Updating ...'
	if ( (!wallet) || (Object.keys(wallet.balances).length == 0) || (loadedAddresses ==  Object.keys(wallet.balances).length) )  {
		console.log('Running Timer');
		var walletWaitTimeoutId = setTimeout("updateAddressList()", 1000);
	} else {
		clearTimeout(walletWaitTimeoutId);
		console.log(wallet);
		addressListOutput.text("");
		var TotalBalance = 0;
		document.getElementById('wallet-address-select').innerHTML = '<option value="">Select Address</option>';
		document.getElementById('newPublisher-floAdd').innerHTML = '<option value="">Select Address</option>';
		document.getElementById('newMediaPublisherFLO').innerHTML = '<option value="">Select Address</option>';
		for (var addr in wallet.balances) {
			addressListOutput.text(addressListOutput.text() + "\n" + addr + " : " + wallet.balances[addr]);
			TotalBalance += wallet.balances[addr];
			document.getElementById('wallet-address-select').innerHTML = document.getElementById('wallet-address-select').innerHTML + '<option value="'+ addr+'">' + addr +'</option>';
			document.getElementById('newPublisher-floAdd').innerHTML = document.getElementById('newPublisher-floAdd').innerHTML + '<option value="'+ addr+'">' + addr +'</option>';
			document.getElementById('newMediaPublisherFLO').innerHTML = document.getElementById('newMediaPublisherFLO').innerHTML + '<option value="'+ addr+'">' + addr +'</option>';
		}
		console.log('TotalBalance = ' + TotalBalance);
		document.getElementById('wallet-balance-flo').innerHTML = TotalBalance + ' FLO';
		document.getElementById('wallet-balance-amount').innerHTML = '$'+Math.round((TotalBalance*FLOUSD)*100)/100;
		var selectInterval = setInterval(function() {
		    if (document.getElementById('wallet-address-select').length > 1) {
		        clearInterval(selectInterval);
				document.getElementById('wallet-address-select').removeAttribute('disabled');
				document.getElementById('newPublisher-floAdd').removeAttribute('disabled');
				document.getElementById('newMediaPublisherFLO').removeAttribute('disabled');
				$('#newAddressBtn').removeClass('disabled');
		    }
		}, 100);
	}
}

// FLOVAULT SEND FLO
function sendFloVault() {
	wallet.sendCoins(sendFromInput.val(), sendToInput.val(), sendAmountInput.val());
    refreshFloVaultBalances();
}