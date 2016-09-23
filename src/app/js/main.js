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

// LOAD MEDIA ARTIFACT VIEW
function loadMediaEntity(obj) {
	$('#info-modal-media').fadeOut(fadeTimer);
	var parentObj = $(obj).parents('.media-entity');
	var mediaType = $(parentObj).attr('media-type');
	// Check Movie for IMDB Verification
	// VERIFICATION DISABLED
	/*
	if (mediaType == 'movie') {
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
	}
  */
	// Load Media Entity View
	if ( (mediaType == 'music') || (mediaType == 'movie') || (mediaType == 'video') ) {
		loadArtifactView2(parentObj);
	} else {
		loadArtifactView(parentObj);
	}
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
	if (!mediaFLO) {
		var mediaFLO = $('.ri-publisher').text();
	}
	var mediaBTC = $('main:visible .BTC-address').html();
	if (!mediaBTC) {
		var mediaBTC = $('.ri-btc-address').text();
	}
	$('#tipAdd-FLO').html(mediaFLO);
	// GENERATE QR CODE FOR FLO TIPS
	var tipAmount = $('input[name="tip-amount"]:checked').val()/FLOUSD;
	tipAmount = Math.round(tipAmount*100000000)/100000000;
	var dname = 'Current artifact display name';
	var tipCurrency = 'florincoin';
	generateQR(mediaFLO, 'tip-QR', 100, 100, tipCurrency, tipAmount, dname);
	if (document.getElementById('sendTipBtn')) {
		document.getElementById('sendTipBtn').setAttribute('onclick','sendTip(this, FLOclient, "' + mediaFLO + '", "FLO")');
	}
	if ( (mediaBTC != 'BTC address') && (mediaBTC != '') ) {
		$('#tipAdd-BTC').html(mediaBTC);
		$('.modal-tabs li[name="tip-bitcoin"]').removeClass('hidden');
		// GENERATE QR CODE FOR BTC TIPS
		tipAmount = $('input[name="tip-amount"]:checked').val()/BTCUSD;
		tipAmount = Math.round(tipAmount*100000000)/100000000;
		tipCurrency = 'bitcion';
		generateQR(mediaBTC, 'BTC-tip-QR', 100, 100, tipCurrency, tipAmount, dname);
		if (document.getElementById('sendBTCTipBtn')) {
			document.getElementById('sendBTCTipBtn').setAttribute('onclick','sendTip(this, BTCclient, "' + mediaBTC + '", "BTC")');
		}
	} else {
		$('#tipAdd-BTC').text('No Address Available');
		$('.modal-tabs li[name="tip-bitcoin"]').addClass('hidden');
	}
	$('#tip-modal .modal-tabs li').not('.hidden').first().click();
	var modalPos = (history.state.currentView == 'artifact') ? ('right') : ('left');
	var tipModalPos = (history.state.currentView == 'artifact') ? ($(obj).parent().width() - $(obj).position().left - 32) : ($(obj).position().left - 50);
	$(obj).parents('.entity-market').find('#tip-modal').css(modalPos,tipModalPos+'px').fadeToggle(fadeTimer);
}

// CHANGE CUSTOM TIP AMOUNT
function changeCustomTipAmount() {
	$('#tip-option-custom').click();
}

// CHANGE FLO TIP AMOUNT
function changeTipAmount(opt) {
	var tipAddBTC = $('#tipAdd-BTC').text();
	var tipAddFLO = $('#tipAdd-FLO').text();
	var tipAmount = ($(opt).attr('id')=='tip-option-custom') ? (parseFloat($(opt).siblings('.tip-input').val())) : parseFloat($(opt).val()) ;
	$('.tip-value').text(tipAmount);
	var tipAmountFLO = Math.round((tipAmount/FLOUSD)*100)/100;
	var tipAmountBTC = Math.round((tipAmount/BTCUSD)*100000000)/100000000;
	$('#tip-modal .flo-usd-output').text(tipAmountFLO);
	$('#tip-modal .btc-usd-output').text(tipAmountBTC);
	var dname = ($('.playlist-tracks .active').data().track.dname) ? ($('.playlist-tracks .active').data().track.dname) : ($('.playlist-tracks .active').data().track.fname);
	var mediaFLO = $('main:visible .FLO-address').html();
	if (!mediaFLO) {
		var mediaFLO = $('.ri-publisher').text();
	}
	var mediaBTC = $('main:visible .BTC-address').html();
	if (!mediaBTC) {
		var mediaBTC = $('.ri-btc-address').text();
	}
	generateQR(mediaFLO, 'tip-QR', 100, 100, 'florincoin', tipAmountFLO, dname);
	generateQR(mediaBTC, 'BTC-tip-QR', 100, 100, 'bitcoin', tipAmountBTC, dname);
}

// SET CUSTOM TIP AMOUNT BY INPUT
function prevTipAmountSet(obj) {
	prevTipAmount = (obj) ? (obj.value) : ($(CustomTipAmount).val());
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

// SEND TIP WITH FLORINCOIN-QT WALLET
function sendTip(obj, client, pubAdd, currency) {
	if ($(obj).hasClass('disabled')) {
		return false;
	}	
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

// CONNECT TO WALLET
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

// WALLET ADDRESS RECEIVE QR CODE
function receiveQR(obj) {
	var publisherAddress = $(obj).find('option:selected').val();
	generateQR(publisherAddress, 'wallet-receive-qrcode', 100, 100, 'florincoin');
}

// FLO QR CODE
function generateQR(address, wrapper, qrw, qrh, wallet, amount, label) {
	var qrWrap = document.getElementById(wrapper);
	qrWrap.innerHTML = '';
//	qrWrap.setAttribute('onclick','loadQR('+wallet+':'+address+')');
	var qrcode = new QRCode(wrapper, {
		text: wallet+':'+address+'?amount='+amount+'&label='+label,
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
    togglePWYWOverlay(false);
    togglePlaybarShadow(true);
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
    togglePWYWOverlay(false);
    togglePlaybarShadow(true);
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
    if (paymentTimeout) {
        clearTimeout (paymentTimeout)
    }	
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

/* SPINNER
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
*/
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

// GO BACK
function goBack() {
	$('#native-player').remove();
	$('#audio-player').jPlayer('destroy');
	resetTipModal();
	navCounter--;
	history.back();
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
