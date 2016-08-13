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
