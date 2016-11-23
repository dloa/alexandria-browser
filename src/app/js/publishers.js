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
			var mediaThumb = mediaIconSVGs[mediaType];
			var mediaHash = thisPublisherMedia[i]['media-data']['alexandria-media']['torrent'];
			var mediaInfo = thisPublisherMedia[i]['media-data']['alexandria-media']['info'];
			var mediaPubTime = thisPublisherMedia[i]['media-data']['alexandria-media']['timestamp'];
			var mediaPubTimeLen = thisPublisherMedia[i]['media-data']['alexandria-media']['timestamp'].toString().length;
			if (mediaPubTimeLen == 10) {
				mediaPubTime = parseInt(mediaPubTime)*1000;
			}					
			mediaPubTime = new Date(mediaPubTime);
			var mediaTimestamp = mediaPubTime.toString().split(' ')[4];
			mediaPubTime = $.datepicker.formatDate("M d, yy", mediaPubTime) + ' ' + mediaTimestamp;
			var mediaTitle = mediaInfo['title'].trim();
			var mediaYear = mediaInfo['year'];
			var mediaDesc = mediaInfo['description'];
			var mediaRuntime = 0;
			var mediaArtist = '';
			if(mediaInfo['extra-info']){
				console.info(mediaInfo['extra-info']);
				if (mediaInfo['extra-info']['runtime']) {
					mediaRuntime = calcRuntime(mediaInfo['extra-info']['runtime']);
				} else if (mediaInfo['extra-info']['files']) {
					mediaRuntime = calcRuntime(mediaInfo['extra-info']['files'][0]['duration']);
				}
				if (mediaInfo['extra-info']['artist']) {
					mediaArtist = mediaInfo['extra-info']['artist'];
				}
				if (mediaInfo['extra-info']['posterFrame']) {
					mediaThumb = '<img src="'+IPFSHost+'/ipfs/'+mediaHash +'/'+mediaInfo['extra-info']['posterFrame']+'" />';
				} else if (mediaInfo['extra-info']['preview']) {
					mediaThumb = '<img src="'+IPFSHost+'/ipfs/'+mediaHash +'/'+mediaInfo['extra-info']['preview']+'" />';
				}
			}
			if ( (mediaRuntime != 0) && (mediaRuntime != '00:00:undefined') ) {
				mediaRuntime = ' &bull; '+mediaRuntime.split('.')[0];
			} else {
				mediaRuntime = '';
			}
			var hasCost = '';
			var sugCost = '';
			if (mediaInfo['extra-info']['files']) {
				if (mediaInfo['extra-info']['files'][0]['sugPlay']) {
					hasCost = '<object data="svg/usd_icon_greencircle.svg" type="image/svg+xml"></object>';
					sugCost = mediaInfo['extra-info']['files'][0]['sugPlay'];
				}
				if (mediaType === 'music') {
					var fileCount = mediaInfo['extra-info']['files'].length;
					var trackCount = 0;
					$(mediaInfo['extra-info']['files']).each(function(){
						if (this.type === 'music') {
							trackCount++;
						}
						fileCount--;
						if ( (fileCount === 0) && (trackCount > 1) ) {
							mediaThumb = mediaIconSVGs['album'];
						}
					});
				}
			}
			var mediaEntity = '<li id="media-' + mediaID + '" class="row media-entity" media-type="' + mediaType + '"><div class="browse-icon" onclick="loadMediaEntity(this);">'+ mediaThumb +'</div><div class="meta-container"><h3 class="media-title" onclick="loadMediaEntity(this);">' + mediaTitle.trim() + '<span class="hasCost">'+hasCost+'</span></h3><br /><div class="media-meta" onclick="loadMediaEntity(this);">' + mediaYear + mediaRuntime +' &bull; <span class="media-pub-time">' + mediaPubTime + '</span> <span class="publisher-id hidden">'+ publisherAddress +'</span></div> <a class="info-icon hidden" onclick="loadInfoModal(this)">'+ infoIconSVG +'info</a><a class="playbtn-icon" onclick="loadMediaEntity(this);">'+ playIconSVG +'play</a> <div class="media-desc hidden">' + mediaDesc + '</div></li>';
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
