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
		deDupeResults(filteredMedia);
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
	deDupeResults(filteredMedia);
}

// DEDUPE SEARCH RESULTS
function deDupeResults(filteredMedia) {
	console.info(filteredMedia);
	var revs = 0;
	var results = {};
	results.length = 0;
	for (var i = filteredMedia.length - 1; i >= 0 ; i--) {
		var txid = filteredMedia[i]['txid'];
		var artifactData = parseArtifactData(filteredMedia[i]);
		var deDupeHash = new String(artifactData['info']['title']+'_'+artifactData['publisher']).hashCode();
		if (results.length === 0) {
			results[results.length] = {
				0: deDupeHash,
				1: artifactData,
				2: txid,
				3: filteredMedia[i]['publisher-name']
			}
			results.length ++;
		} else {
			var isRev = in_array(deDupeHash, results);
			if (isRev === false) {
				results[results.length] = {
					0: deDupeHash,
					1: artifactData,
					2: txid,
					3: filteredMedia[i]['publisher-name']
				}
				results.length ++;
			} else {
				revs++;
			}
		}
	}
	populateSearchResults(results, 'media');
}

function parseArtifactData(artifactObj) {
	if (artifactObj['media-data']){
		var artifactData = artifactObj['media-data']['alexandria-media'];
	} else {
		var artifactData = artifactObj['oip-041']['artifact'];
	}
	return artifactData;
}

function in_array(what, where) {
    var a=false;
    for (var i=0; i<where.length; i++) {
        if(what == where[i][0]) {
            a=true;
            break;
        }
    }
    return a;
}

String.prototype.hashCode = function(){
    if (Array.prototype.reduce){
        return this.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
    } 
    var hash = 0;
    if (this.length === 0) return hash;
    for (var i = 0; i < this.length; i++) {
        var character  = this.charCodeAt(i);
        hash  = ((hash<<5)-hash)+character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

// POPULATE SEARCH RESULTS
function populateSearchResults(results, module) {

	artifact = '';
	if (module === 'publishers') {
		module = 'publisher';
	};
	$('#'+module+'-results-title').remove();
	if ( (module =='media') && (results) ) {
		var revs = 0;
		console.info(results);
		for (var i = results.length - 1; i >= 0; i--) {
			var mediaType = results[i][1]['type'];
			if ( (history.state) && (history.state.mediaTypes) ) {
				if ( (history.state.mediaTypes.length > 0) && (history.state.searchResults == true) && (history.state.mediaTypes.indexOf(mediaType) == -1) ) {
					continue;
				}
			}
			var mediaThumb = mediaIconSVGs[mediaType];
			if (!mediaThumb) {
				console.error('UNKNOWN MEDIA TYPE ICON');
				var mediaThumb = '';
			}
			var mediaID = results[i][2];
			var mediaPublisher = results[i][3];
			var publisherID = results[i][1]['publisher'];
			var mediaHash = results[i][1]['torrent'];
			var mediaInfo = results[i][1]['info'];
			var mediaPubTime = results[i][1]['timestamp'];
			var mediaPubTimeLen = results[i][1]['timestamp'].toString().length;
			if (mediaPubTimeLen == 10) {
				mediaPubTime = parseInt(mediaPubTime)*1000;
			}
			mediaPubTime = new Date(mediaPubTime);
			var mediaTimestamp = mediaPubTime.toString().split(' ')[4];
			mediaPubTime = $.datepicker.formatDate("M d, yy", mediaPubTime) + ' ' + mediaTimestamp;
			var mediaTitle = mediaInfo['title'];
			var mediaYear = mediaInfo['year'];
			var mediaDesc = mediaInfo['description'];
			var mediaRuntime = 0;
			var mediaArtist = '';
			if(mediaInfo['extra-info']){
				if (mediaInfo['extra-info']['runtime']) {
					mediaRuntime = calcRuntime(mediaInfo['extra-info']['runtime']);
				} else if (mediaInfo['extra-info']['files']) {
					mediaRuntime = calcRuntime(mediaInfo['extra-info']['files'][0]['duration']);
				}
				if(mediaInfo['extra-info']['artist']){
					mediaArtist = mediaInfo['extra-info']['artist'];
				}
/* LOAD ARTIFACT PREVIEW IMAGE - NOT IMPLEMENTED BECAUSE IT FORCED DOWNLOAD OF ~ 100 MB
	** Lazyload images
				if (mediaInfo['extra-info']['posterFrame']) {
					mediaThumb = '<img src="'+IPFSHost+'/ipfs/'+mediaHash +'/'+mediaInfo['extra-info']['posterFrame']+'" />';
				} else if (mediaInfo['extra-info']['preview']) {
					mediaThumb = '<img src="'+IPFSHost+'/ipfs/'+mediaHash +'/'+mediaInfo['extra-info']['preview']+'" />';
				}

*/
			}
			if ( (mediaRuntime != 0) && (mediaRuntime != '00:00:undefined') ) {
				mediaRuntime = ' &bull; '+mediaRuntime.split('.')[0];
			} else {
				mediaRuntime = '';
			}
			var thisHasCost = '';
			var sugCost = '';
			var isAlbum = false;
			if (mediaInfo['extra-info']['files']) {
				if (mediaInfo['extra-info']['files'][0]['sugPlay']) {
					thisHasCost = hasCost;
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
			var mediaEntity = '<div id="media-' + mediaID + '" class="row media-entity" media-type="' + mediaType + '"><div class="browse-icon" onclick="loadMediaEntity(this);">'+ mediaThumb +'</div><div class="meta-container"><h3 class="media-title" onclick="loadMediaEntity(this);">' + mediaTitle.trim() + '<span class="hasCost">'+thisHasCost+'</span></h3><br /><div class="media-meta" onclick="loadMediaEntity(this);">' + mediaPublisher + '<span class="publisher-id hidden">'+ publisherID +'</span></div>'+ mediaRuntime +' <span class="media-pub-time">&bull; ' + mediaPubTime + '</span> <a class="info-icon hidden" onclick="loadInfoModal(this)">'+ infoIconSVG +'info</a><a class="playbtn-icon" onclick="loadMediaEntity(this);">'+ playIconSVG +'play</a><div class="media-desc hidden">' + mediaDesc + '</div></div>';
			var thisTitleAndPublisher = mediaTitle+publisherID;
			$('#browse-media-wrap .row').each(function(){
				var checkTitleAndPublisher = $(this).find('.media-title').text() + $(this).find('.publisher-id').text();
				if(checkTitleAndPublisher.toLowerCase() === thisTitleAndPublisher.toLowerCase()){
					revs ++;
					$(this).remove();
				}
			});
			if ($('#browse-media-wrap #'+module+'-results-wrap .row').length < 1){
				$('#browse-media-wrap #'+module+'-results-wrap').append(mediaEntity);
			} else {
				$('#browse-media-wrap #'+module+'-results-wrap .row:first-of-type').before(mediaEntity);
			}
		}
		console.log(revs + ' revisions or dupes found');
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
			var publisherEntity = '<div id="publisher-' + publisherID + '" class="row publisher-entity"><div class="browse-icon publisher-icon" onclick="loadPublisherEntity(this);">'+ publisherIconSVG +'</div><div class="meta-container"><h3 class="publisher-title" onclick="loadPublisherEntity(this);">' + publisherName + '</h3> <div class="publisher-date">' + new Date(parseInt(publisherDate)) + '</div></div>';
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
		var mediaEntity = '<div class="row '+module+'-entity"><div class="'+module+'-icon browse-icon">'+ mediaIcon +'</div><div class="meta-container"><h3 class="'+module+'-title">No Results Found</h3></div></div>';
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
		if ( $(this).children('.row').length === 0 ) {
			$(this).hide();
		} else {
			$(this).show();
			if ($(this).children('.row:first').children('h3').text() != 'No Results Found') {
				visibleResults += $(this).children('.row').length;
			}
		}
	});
	var prevResultCount = $('#results-count-wrap span').text();
	var diffResults = visibleResults - prevResultCount;
	console.log('prevResultCount = '+ prevResultCount);
	console.log('visibleResults = '+ visibleResults);
	console.log('Variation in results = ' + diffResults);
	$('#results-count-wrap span').text(visibleResults);
	$('#browse-media-wrap #results-count-wrap.container').show();
	// Auto-refresh media list
	// THIS IS NOT ACTIVE YET
	// Make this more complex for different use cases (ie. Search reults + Publisher views)
	if ( (history.state.currentView === 'media') && (history.state.searchResults === false) ) {
//		autofeed(true);
	}
}

var liveRefresh;
function autofeed(feed) {
    clearTimeout (window.liveRefresh);
	// Make this more complex for different use cases (ie. Search reults + Publisher views)
    liveRefresh = setTimeout (function () {
		var filteredMedia = searchAPI('media', '*', '');
		console.info(filteredMedia);
		deDupeResults(filteredMedia);
    }, 60000);
}