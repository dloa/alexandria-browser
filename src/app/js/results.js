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
			var mediaEntity = '<div id="media-' + mediaID + '" class="row media-entity" media-type="' + mediaType + '"><div class="browse-icon" onclick="loadMediaEntity(this);">'+mediaIconSVGs[mediaType]+'</div><h3 class="media-title" onclick="loadMediaEntity(this);">' + mediaTitle.trim() + '</h3> <div class="media-meta" onclick="loadMediaEntity(this);">' + mediaYear + ' &bull; ' + mediaPublisher + '<span class="publisher-id hidden">'+ publisherID +'</span></div> '+ mediaRuntime +' <a class="info-icon hidden" onclick="loadInfoModal(this)">'+ infoIconSVG +'info</a><a class="playbtn-icon" onclick="loadMediaEntity(this);">'+ playIconSVG +'play</a><div class="media-pub-time hidden">' + mediaPubTime + '</div><div class="media-desc hidden">' + mediaDesc + '</div>';
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
