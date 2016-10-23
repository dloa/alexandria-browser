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

var flovaultURL = 'https://flovault.alexandria.io';
var tradebotURL = 'https://api.alexandria.io/tradebot';

// FLOVAULT REGISTER
registerBtn.click(function () {
    var data = {};
    if (emailInput.val().length > 3)
        data = {email: emailInput.val()};

    $.post(flovaultURL +"/wallet/create", data, function (response) {
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
function FloVaultIdentify(send) {
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
				updateAddressList(send);
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
function updateAddressList(send) {
	document.getElementById('wallet-balance-amount').innerHTML = 'Updating ...'
	if ( (!wallet) || (Object.keys(wallet.balances).length == 0) || (loadedAddresses ==  Object.keys(wallet.balances).length) )  {
		console.log('Running Timer');
		var walletWaitTimeoutId = setTimeout('updateAddressList('+send+')', 1500);
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
		if (send === true) {
			console.log('Continue to send confirmation.');
			sendTip();
		}	
	}
}

// FLOVAULT SEND FLO
function sendFloVault(sendFrom, sendTo, sendAmount, sendComment) {
		var sendCommentRaw = sendComment;
		console.log(sendComment);
		if ( (history.state.currentView != 'wallet') && (sendCommentRaw != '') ) {
			sendComment = '{ "artifact": "'+window.history.state.subView+'", "comment": "'+sendCommentRaw+'"}';
		}
        console.log( sendFrom + ' ' + sendTo + ' ' + sendAmount + ' ' + sendComment );
        if (window.confirm('Send '+ sendAmount + ' FLO to ' + sendTo + ' with comment: ' + sendCommentRaw)) {
                wallet.sendCoins(sendFrom, sendTo, sendAmount, sendComment, sendcallback);
            refreshFloVaultBalances();
            $('#tip-modal').fadeOut(fadeTimer);
        }
}

// FloVault Callback
function sendcallback(err, data){
    if( err == null ){
	    $(sendToInput).val('');
		$(sendFromInput).val('');
		$(sendToInput).val('');
		$(sendAmountInput).val('');
		$(sendCommentInput).val('');
        alert("Send successful\n"+data.txid);
    }
    else
    {
        console.log(err);
        alert("Send failed");
    }
}

// DISPLAY TRADE MODAL
function tradeModal() {
	if ( (document.getElementById('trade-modal').style.display == 'none') || (document.getElementById('trade-modal').style.display == '') ) {
		var floaddress = document.getElementById('wallet-address-select').value;
		if (floaddress == '') {
			alert('Please select an address in Request Tokens section');
		} else {
			$.ajax({
				url: tradebotURL +'/flobalance',
				success: function(e) {
					console.info(e);
					document.getElementById('trade-balance').innerHTML = Math.round((.5*e*(Math.round((FLOUSD/BTCUSD)*100000000)/100000000))*100000000)/100000000;
				}
			});
			$.ajax({
				url: tradebotURL+'/depositaddress?floaddress='+floaddress,
				success: function(e) {
					document.getElementById('trade-address').innerHTML = e;
					btcAddress = $('#trade-address code').text();
					$('#tradebotQR').html('');
					$('#trade-address img').appendTo('#tradebotQR');
					document.getElementById('trade-address').innerHTML = btcAddress;
					document.getElementById('trade-modal').style.display = 'block';
				},
				error: function(e) {
					console.error(e);
					alert('Sorry. Tradebot has malfunctioned. Please try again later.');
				}
			});
		}
	} else {
		document.getElementById('trade-modal').style.display = 'none';
	}
}

function getTradeBotBitcoinAddress(floaddress, callback){
	$.get(tradebotURL+"/depositaddress?floaddress=" + floaddress + '&raw', function(data){
		callback(data.responseText);
	})
}
