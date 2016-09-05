// DISPLAY BITMSG MODAL
function bitMsgModal() {
	if ( (document.getElementById('bitmsg-modal').style.display == 'none') || (document.getElementById('bitmsg-modal').style.display == '') ) {
		document.getElementById('bitmsg-modal').style.display = 'block';
	} else {
		document.getElementById('bitmsg-modal').style.display = 'none';
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
	    url: librarianHost +'/alexandria/v1/sign',
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
		    url: librarianHost +'/alexandria/v1/send',
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
		    url: librarianHost +'/alexandria/v1/sign',
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
			    url: librarianHost +'/alexandria/v1/send',
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
