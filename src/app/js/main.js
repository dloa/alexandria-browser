/* some global variables to make mistakes only once */

if (location.protocol == 'app:') {
	var bitcoin = require('bitcoin');
	$('.webOnly').remove();
	$('.appOnly').css('display','inline-block');	
	var fs = require('fs-extra');
} else {
	$('.webOnly').css('display','inline-block');
	$('.appOnly').remove();
	var wallet;
	$('#publish-module-link').removeAttr('onclick').attr('href','http://alexandria.io/publisher/');
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
			fullSearch(htmlEscape(document.getElementById('search-main').value));
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
	if ( (window.location.pathname != '/embed.html') && (window.location.pathname != '/artifact.html') ) {
		if ( (document.getElementById('bitmsg-modal').style.display == 'block') && ( (!$(e.target).parents('#bitmsg-modal')[0]) && (!$(e.target).parents('.bitmsg-icon')[0]) ) ) {
				document.getElementById('bitmsg-modal').style.display = 'none';
			}
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
	if(librarianHost == 'https://api.alexandria.io'){
		$('#serverID').text('Gateway');
	} else {
		$('#serverID').text('Local');
	}
	if (location.protocol == 'app:') {
		$('#serverID').click(function(){
			if(librarianHost == 'https://api.alexandria.io'){
				librarianHost = 'http://localhost:41289';
				IPFSHost = 'http://localhost:8080';
				$('#serverID').text('Local');
			} else {
				librarianHost = 'https://api.alexandria.io'
				IPFSHost = 'https://ipfs.alexandria.io';
				$('#serverID').text('Gateway');
			}
			resetAlexandria();
		});
	} else {
		if (IPFSHost == 'https://ipfs.alexandria.io') {
			$('#IPFS-switch').text('IPFS: Gateway');
		} else {
			$('#IPFS-switch').text('IPFS: Local');
		}
		$('#IPFS-switch').click(function(){
			if(IPFSHost == 'https://ipfs.alexandria.io'){
				IPFSHost = 'http://localhost:8080';
				$('#IPFS-switch').text('IPFS: Local');
			} else {
				IPFSHost = 'https://ipfs.alexandria.io';
				$('#IPFS-switch').text('IPFS: Gateway');
			}
			resetAlexandria();
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


/** ROUTER WAS HERE **/


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

/** SVG ICONS WERE HERE **/

// GET ALL PUBLISHERS
function getAllPublishers() {
	document.getElementById('publisher-avatar').src = '';
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
		url: librarianHost+'/alexandria/v1/publisher/get/all',
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
	$('#native-player').remove();
	$('#audio-player').jPlayer('destroy');
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
	publisherTime = parseInt(publisherTime);
	if (publisherTime.toString().length == 10) {
		publisherTime = parseInt(publisherTime)*1000;
	}
	publisherTime = new Date(publisherTime);
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
			var mediaTitle = mediaInfo['title'].trim();
			var mediaYear = mediaInfo['year'];
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
			if (mediaRuntime == 0) {
				mediaRuntime = '';
			}
			var mediaEntity = '<li id="media-' + mediaID + '" class="row media-entity" media-type="' + mediaType + '"><div class="browse-icon" onclick="loadMediaEntity(this);">'+mediaIconSVGs[mediaType]+'</div><h3 class="media-title" onclick="loadMediaEntity(this);">' + mediaTitle.trim() + '</h3> <div class="media-meta">' + mediaYear + ' &bull; ' + mediaRuntime +' <a class="info-icon hidden" onclick="loadInfoModal(this)">'+ infoIconSVG +'info</a><a class="playbtn-icon" onclick="loadMediaEntity(this);">'+ playIconSVG +'play</a><div class="media-pub-time hidden">' + new Date(parseInt(mediaPubTime)) + '</div><div class="media-desc hidden">' + mediaDesc + '</div></div></li>';
			var thisTitle = mediaTitle;
			$('#publisher-media-list li').each(function(){
				var checkTitle = $(this).find('.media-title').text();
				if(checkTitle.toLowerCase() == thisTitle.toLowerCase()){
					$(this).remove();
				}
			});
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
		loadArtifactView2(parentObj);
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
		if ( (mediaType == 'music') || (mediaType == 'movie') || (mediaType == 'video') ) {
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
	$('.media-cover').hide();
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
			$('#media-Tid').attr('onclick', 'copyArtifact("' + IPFSHost + 'ipfs/'+ fileHash + '","'+process.env.HOME+'/Alexandria-Downloads/'+ fileHash + '")').show();
		}
	}
	// HIDE OTHER VIEWS
	if ( (window.location.pathname != '/embed.html') && (window.location.pathname != '/artifact.html') ) {
		document.getElementById('intro').style.display = 'none';
	}
	$('main').hide();
	hideOverlay();
	resetInterface();
	if ( (window.location.pathname != '/embed.html') && (window.location.pathname != '/artifact.html') ) {
		document.getElementById('search').style.display = 'block';
	}
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
	var mediaTid = (media['info']['extra-info']['DHT Hash']) ? (media['info']['extra-info']['DHT Hash']) : (media['torrent']);
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
			var poster = IPFSHost + '/ipfs/'+ fileHash +'/'+ xinfo.poster;
		}
		if(xinfo.posterFrame) {
			var posterFrame = IPFSHost + '/ipfs/'+ fileHash +'/'+ xinfo.posterFrame;
		}		
		if(xinfo.trailer) {
			var trailer = IPFSHost + '/ipfs/'+ fileHash +'/'+ xinfo.trailer;
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
	if ( (window.location.pathname != '/embed.html') && (window.location.pathname != '/artifact.html') ) {
		document.getElementById('viewlabel').style.display = 'inline-block';
	}
	$('#media-txnID').html(mediaID);	
	$('main:visible .FLO-address').html(mediaFLO);
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
//			var embedCode = '<embed type="application/x-vlc-plugin" pluginspage="http://www.videolan.org" target="' + IPFSHost +'/ipfs/'+ fileHash +'/'+ encodeURIComponent(mediaFilename) +'" width="640px" height="360px" />';
//		} else {
			var embedCode = '<video controls="controls" poster="'+ posterFrame +' autoplay"><source src="' + IPFSHost +'/ipfs/'+ fileHash +'/'+ encodeURIComponent(mediaFilename) +'" type="video/mp4" /><param name="autoplay" value="true" /></video>';	
//		}
	} else if ( (mediaType == 'music') || (mediaType == 'podcast') ) {
// 		if (location.protocol == 'app:') {
//			var embedCode = '<embed type="application/x-vlc-plugin" pluginspage="http://www.videolan.org" target="' + IPFSHost +'/ipfs/'+ fileHash +'/'+ encodeURIComponent(mediaFilename) +'" width="640px" height="100px" />';
//		} else {
			var embedCode = '<audio controls="controls"><source src="' + IPFSHost +'/ipfs/'+ fileHash +'/'+ encodeURIComponent(mediaFilename) +'" type="audio/mp3" /></audio>';
//		}
	} else if (mediaType == 'book') {
		var embedCode = '<object data="' + IPFSHost +'/ipfs/'+ fileHash + '" type="application/pdf" width="100%" height="800px" class="book-embed"><p>No PDF plugin installed. You can <a href="' + IPFSHost +'/ipfs/'+ fileHash +'">click here to download the PDF file.</a></p></object>'
	} else if (mediaType == 'recipe') {
		var embedCode = '<object data="' + IPFSHost +'/ipfs/'+fileHash+'" type="text/html" width="100%" height="620px" />';
	} else if (mediaType == 'thing') {
		var embedCode = '<img src="' + IPFSHost +'/ipfs/'+fileHash+'" class="large-poster" />';
	}
	return embedCode;
}

// CHANGE AUDIO TRACK
function changeAudioTrack(obj) {
	var audioPlayer = $('audio:visible');
	var fileHash = $('audio:visible source').attr('src').split('/')[4];
	var trackFile = $(obj).text();
	$('audio:visible source').attr('src', '' + IPFSHost +'/ipfs/'+ fileHash +'/'+ encodeURIComponent(trackFile));
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
	stateObj.searchTerm = (document.getElementById('search-main').value != '') ? (htmlEscape(document.getElementById('search-main').value)) : (searchFor);
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
	$('#native-player').remove();
	$('#audio-player').jPlayer('destroy');
	document.getElementById('intro').style.display = 'none';
	$('main').not('#browse-media').hide();
	$('body').append($('#info-modal-media'));
	$('#browse-media-wrap .row').remove();
	$('.sharing-ui').hide();
	$('.wallet-ui').hide();
	$('.publisher-ui').hide();
	document.getElementById('search').style.display = 'block';
	document.getElementById('share-modal').style.display = 'none';
	resetTipModal();
	document.getElementById('tip-modal').style.display = 'none';
	$('#user-modal').fadeOut(fadeTimer);
	$('.view-media-ui').hide();
	$('.view-publishers-ui').hide();
	document.getElementById('publisher-avatar').src = '';
	if ( ( (obj == '') && (history.state) && (history.state.searchResults != true) ) || (resetSearch) && ( (history.state) && (!history.state.isFront) ) ) {
		var filteredMedia = searchAPI('media', '*', '');
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
		if ( (!history.state) || (history.state.searchResults != true) ) {
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
			var publisherID = results[i]['media-data']['alexandria-media']['publisher'];
			var mediaInfo = results[i]['media-data']['alexandria-media']['info'];
			var mediaPubTime = results[i]['media-data']['alexandria-media']['timestamp'];
			var mediaPubTimeLen = results[i]['media-data']['alexandria-media']['timestamp'].toString().length;
			if (mediaPubTimeLen == 10) {
				mediaPubTime = parseInt(mediaPubTime)*1000;
			}					
			var mediaTitle = mediaInfo['title'];
			var mediaYear = mediaInfo['year'];
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
				mediaRuntime = '<div class="media-runtime">&bull; <span>' + mediaRuntime + '</span></div>';
			} else {
				mediaRuntime = '';
			}
			var mediaEntity = '<div id="media-' + mediaID + '" class="row media-entity" media-type="' + mediaType + '"><div class="browse-icon" onclick="loadMediaEntity(this);">'+mediaIconSVGs[mediaType]+'</div><h3 class="media-title" onclick="loadMediaEntity(this);">' + mediaTitle.trim() + '</h3> <div class="media-meta" onclick="loadMediaEntity(this);">' + mediaYear + ' &bull; ' + mediaPublisher + '<span class="publisher-id hidden">'+ publisherID +'</span></div> '+ mediaRuntime +' <a class="info-icon hidden" onclick="loadInfoModal(this)">'+ infoIconSVG +'info</a><a class="playbtn-icon" onclick="loadMediaEntity(this);">'+ playIconSVG +'play</a><div class="media-pub-time hidden">' + new Date(parseInt(mediaPubTime)) + '</div><div class="media-desc hidden">' + mediaDesc + '</div>';
			var thisTitleAndPublisher = mediaTitle+publisherID;
			$('#browse-media-wrap .row').each(function(){
				var checkTitleAndPublisher = $(this).find('.media-title').text()+$(this).find('.publisher-id').text();
				if(checkTitleAndPublisher.toLowerCase() == thisTitleAndPublisher.toLowerCase()){
					$(this).remove();
				}
			});
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
	afterSearch();
}

function afterSearch() {
	$('#browse-media').show();
	var visibleResults = 0;
	$('#browse-media-wrap .container').each(function() {
		if ( $(this).children('.row').length == 0 ) {
			$(this).hide();
		} else {
			$(this).show();
			if ($(this).children('.row:first').children('h3').text() != 'No Results Found') {
				visibleResults += $(this).children('.row').length;
			}
		}
	});
	$('#results-count-wrap span').text(visibleResults);
	$('#browse-media-wrap #results-count-wrap.container').show();
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
	if ( (window.location.pathname != '/embed.html') && (window.location.pathname != '/artifact.html') ) {		document.getElementById('disabler').style.display = 'none';	
		document.getElementById('app-overlay').style.display = 'none';
	}
}

// RESIZE TABS
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
	$('#about #video-embed').append('<video controls="controls" poster="https://i.ytimg.com/vi/z_u-ndscZjY/hqdefault.jpg" autoplay><source src="' + IPFSHost +'/ipfs/QmUbsjbjkRu41JqiyAhq61inUpDSB8uMHsTkdtbHg2jYmv/" type="video/mp4"></video>');
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
				$('#refreshBalance').attr('onclick','refreshFloVaultBalances();');
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
		url: librarianHost+'/alexandria/v1/wallet/getbalance',
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
			document.getElementById('wallet-from-address-select').innerHTML = '<option value="">Select Address</option>';
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
				document.getElementById('wallet-from-address-select').innerHTML = document.getElementById('wallet-from-address-select').innerHTML + '<option value="'+address[a]+'">' + address[a] +'</option>';
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
			document.getElementById('wallet-from-address-select').removeAttribute('disabled');
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
	$('.pwyw-close').click();
	$('#native-player').remove();
	$('#audio-player').jPlayer('destroy');
	document.getElementById('tip-comment').value = '';
	if ( (window.location.pathname != '/embed.html') && (window.location.pathname != '/artifact.html') ) {		document.getElementById('viewlabel').style.display = 'none';
		document.getElementById('disabler').style.display = 'none';
		if (document.getElementById('intro').style.display == 'block') {
			$('#intro').fadeOut(fadeTimer);
		}
	}
	$('#browse-media h2').remove();
	$('.search').attr('disabled',false);
	$('body').append($('#info-modal-media'));
	$('#browse-media-wrap .row').remove();
	document.getElementById('share-modal').style.display = 'none';
	document.getElementById('tip-modal').style.display = 'none';
	resetQR();
	resetTipModal();
	$('#share-modal').css({
			left:'initial',
			right:'initial'
		}).hide();
	$('#tip-modal').css({
			'left':'initial',
			'right':'initial'
		}).hide();
	if ( (window.location.pathname != '/embed.html') && (window.location.pathname != '/artifact.html') ) {
		if (document.getElementById('user-modal').style.display == 'block') {
			$('#user-modal').fadeOut(fadeTimer);
		}
	}
}

// RESET ALEXANDRIA
function resetAlexandria() {
	$('.pwyw-close').click();
	$('#native-player').remove();
	$('#audio-player').jPlayer('destroy');
	$('#playbar-container').show();
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
	resetTipModal();
	resetQR();
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

// RESET TIP MODAL
function resetTipModal() {
	$('.ri-publisher').text('');
	$('.ri-btc-address').text('');
	$('#tipAdd-FLO').html('');
	$('#tipAdd-BTC').html('');
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
	var videoContent = '<video controls="controls" poster="" autoplay><source src="'+videoURL+'" type="video/mp4" /><param name="autoplay" value="true" /></video>'
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
	if ( (window.location.pathname != '/embed.html') && (window.location.pathname != '/artifact.html') ) {
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
}
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
	$('#native-player').remove();
	$('#audio-player').jPlayer('destroy');
	resetTipModal();
	navCounter--;
	history.back();
}

// MAKE HISTORY AND LOCATION
function makeHistory(stateObj, newTitle) {
	navCounter++;
	if (location.protocol == 'app:') {		
		if ( ( (document.getElementById('browser-nav')) && (history.state) && (history.state.isFront) ) || (navCounter == 1) ) {
			$('#browser-nav').remove();
		} else {
			resetInterface();
			if (!document.getElementById('browser-nav')) {
				$('#logo').after('<div id="browser-nav" class="nodrag"><a onclick="goBack()">Back</a></div>');
			}
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
		newUrl = ((!stateObj.searchOn) || (stateObj.searchOn == '*')) ? (newUrl + '/' + stateObj.searchTerm.toString().toLowerCase().replace(/\s/g , "-")) : (newUrl + '/' + stateObj.searchOn + '/' + stateObj.searchTerm.toString().toLowerCase().replace(/\s/g , "-"));
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
	if ( (window.location.pathname != '/embed.html') && (window.location.pathname != '/artifact.html') ) {		document.getElementById('alexandria-breadcrumbs').innerHTML = newBreadcrumbs;
		document.getElementById('alexandria-breadcrumbs').style.display = 'inline-block';
		document.getElementById('viewlabel').style.display = 'inline-block';
	}
	document.title = newTitle;
	history.pushState(stateObj, newTitle, newUrl);
	// IFRAME EMBED CODE
	var embedUrl = newUrl;
        var prefix = window.location.protocol + '//' + window.location.hostname;
        if (window.location.hostname === 'alexandria.io')
            prefix = 'https://embed.alexandria.io';
                
	if ( (stateObj.mediaType == 'music') || (stateObj.mediaType == 'video') || (stateObj.mediaType == 'movie') ) {
		embedUrl = prefix + '/artifact.html#' + stateObj.subView;
	} else {
		embedUrl = prefix + '/embed.html#' + stateObj.subView;
	}
	var iframeEmbedCode = '<iframe src="'+ embedUrl +'" width="800px" height="600px"></iframe>';
	$('.iframecode').text(iframeEmbedCode);
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
	loadScript('js/SimpleWallet.js', SimpleWallet_loaded);
}

function SimpleWallet_loaded() {
	console.log('SimpleWallet.js loaded');
	loadScript('js/SimpleDeps.js', SimpleDeps_loaded);
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

var sendFromInput = $("#wallet-from-address-select");
var sendToInput = $("#wallet-send-address");
var sendAmountInput = $("#wallet-send-amount-flo");
var sendCommentInput = $("#wallet-send-message");
var sendOutput = $("#sendOutput");

// FLOVAULT REGISTER
registerBtn.click(function () {
    var data = {};
    if (emailInput.val().length > 3)
        data = {email: emailInput.val()};

    $.post("https://flovault.alexandria.io/wallet/create", data, function (response) {
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
		url: 'https://flovault.alexandria.io/wallet/checkload/' + identifierInput.val(),
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
		var walletWaitTimeoutId = setTimeout("updateAddressList()", 1500);
	} else {
		clearTimeout(walletWaitTimeoutId);
		console.log(wallet);
		addressListOutput.text("");
		var TotalBalance = 0;
		document.getElementById('wallet-address-select').innerHTML = '<option value="">Select Address</option>';
		document.getElementById('wallet-from-address-select').innerHTML = '<option value="">Select Address</option>';
		document.getElementById('newPublisher-floAdd').innerHTML = '<option value="">Select Address</option>';
		document.getElementById('newMediaPublisherFLO').innerHTML = '<option value="">Select Address</option>';
		for (var addr in wallet.balances) {
			addressListOutput.text(addressListOutput.text() + "\n" + addr + " : " + wallet.balances[addr]);
			TotalBalance += wallet.balances[addr];
			document.getElementById('wallet-address-select').innerHTML = document.getElementById('wallet-address-select').innerHTML + '<option value="'+ addr+'">' + addr +'</option>';
			document.getElementById('wallet-from-address-select').innerHTML = document.getElementById('wallet-from-address-select').innerHTML + '<option value="'+ addr+'">' + addr +'</option>';
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
				document.getElementById('wallet-from-address-select').removeAttribute('disabled');
				document.getElementById('newPublisher-floAdd').removeAttribute('disabled');
				document.getElementById('newMediaPublisherFLO').removeAttribute('disabled');
				$('#newAddressBtn').removeClass('disabled');
		    }
		}, 100);
	}
}

// FLOVAULT SEND FLO
function sendFloVault() {
        console.log( sendFromInput.val() + ' ' + sendToInput.val() + ' ' + sendAmountInput.val() + ' ' + sendCommentInput.val() );
        if (window.confirm('Send '+ sendAmountInput.val() + ' FLO to ' + sendToInput.val() + ' with comment: ' + sendCommentInput.val() + '?')) {
                wallet.sendCoins(sendFromInput.val(), sendToInput.val(), sendAmountInput.val(), sendCommentInput.val(), sendcallback);
            refreshFloVaultBalances();
        }
}

// FloVault Callback
function sendcallback(err, data){
    if( err == null ){
        alert("Send successful\n"+data.txid);
    }
    else
    {
        console.log(err);
        alert("Send failed");
    }
}

// HTML ESCAPE
function htmlEscape(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Find key:value in JSON Obj
function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
}
