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
	if (!isEmbed) {
		document.getElementById('intro').style.display = 'none';
	}
	$('main').hide();
	hideOverlay();
	resetInterface();
	if (!isEmbed) {
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
	if (!isEmbed) {
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
	displayEmbedCode(mediaID, mediaType, false);
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
