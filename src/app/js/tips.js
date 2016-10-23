// DISPLAY TIP MODAL
function loadTipModal(obj) {
	console.info(obj);
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
	var dname = '';
	if ($('.playlist-tracks .active').data()) {
		dname = ($('.playlist-tracks .active').data().track.dname) ? ($('.playlist-tracks .active').data().track.dname) : ($('.playlist-tracks .active').data().track.fname);
	}
	var tipCurrency = 'florincoin';
	generateQR(mediaFLO, 'tip-QR', 100, 100, tipCurrency, tipAmount, dname);
	if (wallet) {
		$('#sendTipBtn').attr('onclick','sendTip()').removeClass('hidden');
	} else {
		$('#sendTipBtn').attr('onclick','showWalletAuth(true)').removeClass('hidden');
	}
	/* Old send-from-wallet code for app
	if (document.getElementById('sendTipBtn')) {
		document.getElementById('sendTipBtn').setAttribute('onclick','sendTip(this, FLOclient, "' + mediaFLO + '", "FLO")');
	}
	*/
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
	var dname = '';
	if ($('.playlist-tracks .active').data()) {
		dname = ($('.playlist-tracks .active').data().track.dname) ? ($('.playlist-tracks .active').data().track.dname) : ($('.playlist-tracks .active').data().track.fname);
	}
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
	var opt = $(obj).siblings('input[type="radio"]');
	changeTipAmount(opt);
}

function sendTip(obj, client, pubAdd, currency) {
	// SEND TIP WITH FLORINCOIN-QT WALLET
	if (window.location.protocol == 'app:') {
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
	} else {
		// SEND TIP WITH FLOVAULT WALLET
		var sendTipTo = $('.tip-address:visible').text();
		var sendTipAmount = $('.tip-amount-crypto:visible').text();
		var sendTipComment = $('#tip-comment').val();
		var sendTipFrom = getSendFrom(sendTipAmount);
		if (sendTipFrom == '') {
			alert('Insufficient Florincoin');
		} else {
			sendFloVault(sendTipFrom, sendTipTo, sendTipAmount, sendTipComment);
		}
	}
}

function getSendFrom(sendAmount) {
	var sendFromAdd = '';
	for (var addr in wallet.balances) {
		console.log(wallet.balances[addr]);
		console.log(wallet.addresses[addr].addr);
		if (wallet.balances[addr] >= sendAmount) {
			sendFromAdd = wallet.addresses[addr].addr;
		}
	}
	return sendFromAdd;
}

// LOAD TIP-TO-ALEXANDRIA MODAL
function showTipAlexandriaModal() {
	getCryptos();
	$('#tip-alexandria-modal').fadeIn(fadeTimer);
	document.getElementById('app-overlay').style.display = 'block';
}
