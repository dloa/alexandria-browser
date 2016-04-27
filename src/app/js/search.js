var serverAddress = 'libraryd.alexandria.media'; // Dev
// var serverAddress = 'localhost';

// MEDIA + PUBLISHER SEARCH API
window.searchAPI = function(module, searchOn, searchFor) {
	if ( (searchOn == 'type') && (searchFor.length > 1) ) {
		searchFor = '['+searchFor+']';
	} else {
		searchFor = '"'+searchFor+'"';
	}
	queryString = '{"protocol":"'+ module +'","search-on":"'+ searchOn +'","search-for":'+searchFor+',"search-like": true}';
	console.log(queryString);
	var mediaData;
	$('body').append($('#info-modal-media'));
	$('#browse-media-wrap .row').remove();
	$.ajax({
		type: "POST",
		url: 'http://'+ serverAddress +':41289/alexandria/v1/search',
		data: queryString.toString(),
		success: function (e) {
			mediaData = $.parseJSON(e).response;
		},
		async:   false
	});
	return mediaData;
}

