// GENERAL SEARCH
function fullSearch(searchFor) {
	$('main').not('#browse-media').hide();
	$('.sharing-ui').hide();
	$('.wallet-ui').hide();
	$('.publisher-ui').hide();
	$('.view-media-ui').hide();
	$('.view-publishers-ui').hide();
	hideOverlay();
	resetInterface();
	document.getElementById('search').style.display = 'block';
	var publisherResults = searchAPI('publisher', 'name', searchFor);
	var mediaResults = searchAPI('media', '*', searchFor);
	$('#adv-search').fadeOut(fadeTimer);
	var stateObj = {
		currentView: 'search',
		searchResults: true
	}
	stateObj.searchTerm = (document.getElementById('search-main').value != '') ? (htmlEscape(document.getElementById('search-main').value)) : (searchFor);
	makeHistory(stateObj, 'ΛLΞXΛNDRIΛ > Search > '+ stateObj.searchTerm);
	populateSearchResults(publisherResults, 'publisher');
	populateSearchResults(mediaResults, 'media');
}

// ADVANCED SEARCH
function selectSearchMediaType(obj){
	$(obj).toggleClass('active');
	$('#adv-search .module-links a.active').each(function(){
		// filterTypes.push($(this).attr('value'));
	});
}

// EXECUTE ADVANCED SEARCH
function buildSearch() {
	$('main').not('#browse-media').hide();
	hideOverlay();
	resetInterface();
	document.getElementById('search').style.display = 'block';
	$('.sharing-ui').hide();
	$('.wallet-ui').hide();
	$('.publisher-ui').hide();
	$('.view-media-ui').hide();
	$('.view-publishers-ui').hide();
	var searchProtocol = document.getElementById('searchModule').value;
	var searchOn = (searchProtocol == 'media') ? (searchOn = '*') : (searchOn = 'name') ;
	var AdvSearchResults = searchAPI(searchProtocol, searchOn, document.getElementById('searchTermInput').value);	
	$('#adv-search').fadeOut(fadeTimer);
	document.getElementById('search-main').value = document.getElementById('searchTermInput').value;
	$('#browse-media .module-links a').removeClass('active');
	var filterTypes = [];
	$('#adv-search .module-links a.active').each(function(){
		filterTypes.push($(this).attr('value'));
		$('#browse-media .module-links a[value="'+$(this).attr('value')+'"]').addClass('active');
	});
	var stateObj = {
		currentView: 'search',
		searchResults: true,
		searchTerm: document.getElementById('searchTermInput').value,
		mediaTypes: filterTypes,
		module: searchProtocol
	}
	makeHistory(stateObj, 'ΛLΞXΛNDRIΛ > '+ searchProtocol.charAt(0).toUpperCase() + searchProtocol.slice(1) +' > Search > '+ stateObj.searchTerm);
	populateSearchResults(AdvSearchResults, searchProtocol);
	document.getElementById('searchTermInput').value = '';
}

// CLEAR ADVANCED SEARCH
function cancelSearch() {
	$('#adv-search').fadeToggle(fadeTimer).find('input[type="text"]').val('');
}

// SEARCH BY FIELD
function searchByField(module, searchOn, searchFor) {
	var AdvSearchResults = searchAPI(module, searchOn, searchFor);
	$('main').not('#browse-media').hide();
	hideOverlay();
	resetInterface();
	document.getElementById('search').style.display = 'block';
	$('#browse-media .module-links a').removeClass('active');
	$('.view-media-ui').hide();
	$('.view-publishers-ui').hide();
	var stateObj = {
		currentView: 'search',
		searchResults: true,
		searchTerm: searchFor,
		module: module,
		searchOn: searchOn
	}
	makeHistory(stateObj, 'ΛLΞXΛNDRIΛ > '+ stateObj.module.charAt(0).toUpperCase() + stateObj.module.slice(1) +' > Search > ' + searchOn + ' > ' + stateObj.searchTerm.charAt(0).toUpperCase() + stateObj.searchTerm.slice(1));
	populateSearchResults(AdvSearchResults, module);
}