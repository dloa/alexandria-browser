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
