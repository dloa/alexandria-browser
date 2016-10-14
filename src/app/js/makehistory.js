// MAKE HISTORY AND LOCATION
function makeHistory(stateObj, newTitle) {
	navCounter++;
	if (location.protocol == 'app:') {		
		if ( ( (document.getElementById('browser-nav')) && (history.state) && (history.state.isFront) ) || (navCounter == 1) ) {
			$('#browser-nav').remove();
		} else {
			resetInterface();
			if (!document.getElementById('browser-nav')) {
				$('#logo').after('<div id="browser-nav" class="nodrag"><a onclick="goBack()">Back</a></div>');
			}
		}
	}
	$('#viewlabel').children().hide();
	console.log('Make History!');
	var newUrl = (stateObj.currentView != 'front') ? (document.location.origin + document.location.pathname+'#') : (document.location.origin + document.location.pathname);
	var newBreadcrumbs = '';
	if ( (stateObj.currentView != 'front') && (stateObj.currentView.slice(0,3) != 'add') ) {
		if (stateObj.module) {
			var callFunction = (stateObj.module == 'media') ? ('filterMediaByType(&apos;&apos;, true)') : ('getAllPublishers()') ;
			newBreadcrumbs = (stateObj.module == 'publisher') ? (newBreadcrumbs + ' / <a onclick="'+ callFunction +';" class="currentView-breadcrumb">'+stateObj.module.charAt(0).toUpperCase() + stateObj.module.slice(1) + 's'+'</a>') : (newBreadcrumbs + ' / <a onclick="'+ callFunction +';" class="currentView-breadcrumb">'+stateObj.module.charAt(0).toUpperCase() + stateObj.module.slice(1)+'</a>');
			newUrl = (stateObj.module == 'publisher') ? (newUrl + '/'+stateObj.module + 's') : (newUrl + '/' + stateObj.module);
		}
		if (!stateObj.subView) {
			if (stateObj.currentView == 'media') {
				newBreadcrumbs = newBreadcrumbs + ' / <a onclick="setMediaTypeFilter(&apos;&apos;,true);" class="currentView-breadcrumb">'+ stateObj.currentView +'</a>';
			} else if (stateObj.currentView == 'search') {
				newBreadcrumbs = (stateObj.searchOn) ? (newBreadcrumbs + ' / <a onclick="searchByField(&apos;media&apos;, &apos;*&apos;,&apos;'+stateObj.searchTerm+'&apos;);" class="currentView-breadcrumb">'+ stateObj.currentView +'</a>') : (newBreadcrumbs + ' / <a onclick="setMediaTypeFilter(&apos;&apos;,true);" class="currentView-breadcrumb">'+ stateObj.currentView +'</a>');
			}
			newUrl = newUrl + '/' + stateObj.currentView;
		}
	}
	if ( (stateObj.mediaTypes) && (stateObj.mediaTypes[0]) && (stateObj.mediaTypes.length > 0) ) {
		var breadString = '';
		var urlString = '';
		for (var i = 0; i < stateObj.mediaTypes.length; i++) {
			var mediaTypeStr = (stateObj.mediaTypes[i] != 'music') ? (stateObj.mediaTypes[i].charAt(0).toUpperCase() + stateObj.mediaTypes[i].slice(1) + 's') : (stateObj.mediaTypes[i].charAt(0).toUpperCase() + stateObj.mediaTypes[i].slice(1));
			breadString = (breadString == '') ? (mediaTypeStr) : (breadString + ' + ' + mediaTypeStr);
			urlString = (urlString == '') ? ('type/'+stateObj.mediaTypes[i]) : (urlString + '-' + stateObj.mediaTypes[i]);
		}
		newBreadcrumbs = newBreadcrumbs + ' / ' + breadString;
		newUrl = newUrl + '/' + urlString;
	}
	if (stateObj.searchTerm) {
		newBreadcrumbs = ((!stateObj.searchOn) || (stateObj.searchOn == '*')) ? (newBreadcrumbs + ' / ' + stateObj.searchTerm) : (newBreadcrumbs + ' / <span id="breadcrumbs-searchOn">' + stateObj.searchOn + '</span> / ' + stateObj.searchTerm);
		newUrl = ((!stateObj.searchOn) || (stateObj.searchOn == '*')) ? (newUrl + '/' + stateObj.searchTerm.toString().toLowerCase().replace(/\s/g , "-")) : (newUrl + '/' + stateObj.searchOn + '/' + stateObj.searchTerm.toString().toLowerCase().replace(/\s/g , "-"));
	} else if (stateObj.subView) {
		if (stateObj.artifactTitle) {
			newBreadcrumbs = newBreadcrumbs + ' / <a onclick="setMediaTypeFilter(&apos;&apos;,true);" class="currentView-breadcrumb">Media</a> / <a onclick="loadPublisherEntity(this)" id="publisher-'+ stateObj.publisherId +'">'+ stateObj.artifactPublisher +'</a> / <a onclick="filterMediaByType(&apos;'+stateObj.mediaType+'&apos;)">' + stateObj.mediaType.charAt(0).toUpperCase() + stateObj.mediaType.slice(1) + '</a> / ' + stateObj.artifactTitle;
		} else {
			newBreadcrumbs = newBreadcrumbs + ' / <a onclick="getAllPublishers()" class="currentView-breadcrumb">Publishers</a> / ' + stateObj.subView;
		}
		newUrl = newUrl + '/' + stateObj.subView;
	} else if (stateObj.currentView.slice(0,3) == 'add') {		
		newBreadcrumbArray = stateObj.currentView.split('-');
		var breadString = '';
		for (var i = 0; i < newBreadcrumbArray.length; i++) {
			breadString = (breadString == '') ? (newBreadcrumbArray[i].charAt(0).toUpperCase() + newBreadcrumbArray[i].slice(1)) : (breadString + ' ' + newBreadcrumbArray[i].charAt(0).toUpperCase() + newBreadcrumbArray[i].slice(1))
		}
		newBreadcrumbs = newBreadcrumbs + ' / ' + breadString;
		newUrl = newUrl + '/' + stateObj.currentView;		
	}
	if ( (newBreadcrumbs == '') && (stateObj.currentView != 'front') ) {
		newBreadcrumbs = newBreadcrumbs + ' / ' + stateObj.currentView.charAt(0).toUpperCase() + stateObj.currentView.slice(1);
		
	}
	if (!isEmbed) {
		document.getElementById('alexandria-breadcrumbs').innerHTML = newBreadcrumbs;
		document.getElementById('alexandria-breadcrumbs').style.display = 'inline-block';
		document.getElementById('viewlabel').style.display = 'inline-block';
	}
	document.title = newTitle;
	history.pushState(stateObj, newTitle, newUrl);
}
