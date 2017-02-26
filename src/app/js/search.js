// MEDIA + PUBLISHER SEARCH API
window.searchAPI = function(module, searchOn, searchFor) {
	if ( (searchOn == 'type') && (searchFor.length > 1) ) {
		searchFor = '['+searchFor+']';
	} else {
		searchFor = '"'+searchFor+'"';
	}
	queryString = '{"protocol":"'+ module +'","search-on":"'+ searchOn +'","search-for":'+searchFor+',"search-like": true}';
	var mediaData;
	$.ajax({
		type: "POST",
		url: librarianHost +'/alexandria/v2/search',
		data: queryString.toString(),
		success: function (e) {
			mediaData = $.parseJSON(e).response;
		},
		async:   false
	});

	// HACK: OstlerDev
	// Hack oip to conform to alexandria-media temporarialy. 
	if (mediaData){
		var count = 0;
		for (var i = 0; i < mediaData.length; i++) {
			if(mediaData[i]['oip-041']){
				mediaData[i] = oipDowngrade(mediaData[i]);
				count++;
			}
		}

		console.log("Conformed " + count + " OIP-041 Artifacts to alexandria-media Artifacts");
		var sortedResults = mediaData.sort(function(a, b) {
		    return parseFloat(a.block) - parseFloat(b.block);
		});

		return sortedResults;

	} else {
		return mediaData;
	}

}

// This method downgrades oip-041 objects to alexandria-media objects until the code can be updated to only support oip-041.
window.oipDowngrade = function(oipObject){
	// Pull out of casing
	var oip = oipObject["oip-041"];

	var alexandriaObject = {  
		"media-data":{  
			"alexandria-media":{  
				"torrent": oip.artifact.storage.location,
				"publisher": oip.artifact.publisher,
				"timestamp": oip.artifact.timestamp*1000,
				"type": oip.artifact.type,
				"info":{  
					"title": oip.artifact.info.title,
					"description":oip.artifact.info.description,
					"year": oip.artifact.info.year,
					"extra-info": oip.artifact.info.extraInfo ? oip.artifact.info.extraInfo : oip.artifact.info['extra-info']
				},
				"payment":oip.artifact.payment
			},
			"signature":oip.signature
		},
		"txid": oipObject.txid,
		"block": oipObject.block
	}

	alexandriaObject["media-data"]["alexandria-media"]["info"]["extra-info"]["DHT Hash"] = oip.artifact.storage.location;

	// Add artist name if it exists to the "publisher-name" for now. This is a hack as oip-041 standards do not include a publisher name. This might need to be updated in LibraryD to be included.
	if (oip.artifact.info.extraInfo && oip.artifact.info.extraInfo.artist){
		alexandriaObject['publisher-name'] = oip.artifact.info.extraInfo.artist;
	}

	if(oip.artifact.info['extra-info'] && oip.artifact.info['extra-info'].artist){
		alexandriaObject['publisher-name'] = oip.artifact.info['extra-info'].artist;
	}

	// Conform each file to be fixed.
	// Add files.
	if (oip.artifact.storage.files){
		var files = oip.artifact.storage.files;
		for (var i = 0; i < files.length; i++) {
			if (files[i].filename && !files[i].fname){
				files[i].fname = files[i].filename;
				delete files[i].filename;
			}
			if (files[i].displayname && !files[i].dname){
				files[i].dname = files[i].displayname;
				delete files[i].displayname;
			}
		}

		alexandriaObject["media-data"]["alexandria-media"]["info"]["extra-info"].files = [];
		alexandriaObject["media-data"]["alexandria-media"]["info"]["extra-info"].files = files;
	}

	return alexandriaObject;
}