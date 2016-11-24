// v0.6 LOAD ARTIFACT VIEW
function loadArtifactView2(objMeta) {
	// HIDE OTHER VIEWS
    if ($('#intro').length > 0) {
    	document.getElementById('intro').style.display = 'none';
    }
	$('main').hide();
	hideOverlay();
	resetInterface();
	$('#search').show();
	$('.wallet-ui').hide();
	$('.publisher-ui').hide();
	$('.sharing-ui').hide();
	$('.view-publishers-ui').hide();
	$('#view-media .entity-view').hide();
	// SHOW MEDIA VIEW
    artifactLoaded = false;
	$('#view-artifact').show();
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
    console.log (mediaID, thisMediaData);
	$('.media-cover').hide();
    window.doMountMediaBrowser('#media-browser', thisMediaData);
}

var day_avg = false;
var delay = 5000;
var keepHash;
var mainFile;
var URL_RECV = "https://api.alexandria.io/payproc/receive";
var URL_GETRECVD = "https://api.alexandria.io/payproc/getreceivedbyaddress/";

var artifactLoaded = false;
var posterFrame = '';

window.doMountMediaBrowser = function (el, data) {
    console.log (el, data);
    $('.media-cover img').attr('src','');
    $('.jp-type-single').hide();
    return mountMediaBrowser(el, data);
}

function formatInt(num, length) {
    var r = "" + num;
    while (r.length < length) {
        r = "0" + r;
    }
    return r;
}

function fixDataMess(data) {
    var ret = [];
    var i = 2;
    var j = 'filename';

    while (data.hasOwnProperty(j)) {
        ret.push(data[j]);


        j = 'track' + formatInt (i++, 2);
    }

    return ret;
}

function prettifyTrack (track, xinfo) {
    return track
        .replace (xinfo.artist, '')
        .replace (' - ', '')
        .replace (/\.(mp3|flac)$/, '')
        .replace (/^[0-9]+ +/, '');
}

function renderPlaylistFilesHTML (files, xinfo, el, artifactType, extraFiles) {

    // Remove all current elements
    el.empty();
    extraFiles.parent().show();
    extraFiles.empty();
    var i = 1;

    var trackTime = secondsToPrettyString(parseInt(xinfo.runtime), true);
    if (files.length > 1) {
    	trackTime = '';
    }

    files.forEach (function (file) {

        // Setup cell for price to play, blank td when disallowPlay === true
        var tdPlay = "";
        if (file.disallowPlay && file.disallowPlay === true) {
            tdPlay = "<td class=\"price disabled\"><span>$<span class=\"price\">N/A</span></span></td>";
        } else {
            tdPlay = "<td class=\"price tb-price-play\"><span>$<span class=\"price\">" + (file.sugPlay ? file.sugPlay : "Free!") + "</span></span></td>";
        }

        // Setup cell for price to buy, N/A when disallowBuy === true
        var tdBuy = "";
        if (file.disallowBuy && file.disallowBuy === true) {
            tdBuy = "<td class=\"price disabled\"><span>$<span class=\"price\"><span>N/A</span></span></td>";
        } else {
            tdBuy = "<td class=\"price tb-price-download\"><span>$<span class=\"price\"><span>" + (file.sugBuy ? file.sugBuy : "Free!") + "</span></span></td>";
        }

        // Only add files to the main playlist where type matches artifact type.
	// Extra files get added to a separate table
        // ToDo: Check for all different file types once implemented
        if (file.type != artifactType) {
		extraFiles.append("<tr>" +
		          "<td>" + (file.dname ? file.dname : file.fname) + "</td>" +
		          tdBuy +
		          "</tr>");
		var trackEl = extraFiles.children().last();
		trackEl.data({track: file, name: name, url: IPFSUrl([xinfo['DHT Hash'], file.fname]), sugPlay: file.sugPlay, minPlay: file.minPlay, sugBuy: file.sugBuy, minBuy: file.minBuy});
	} else {

		el.append("<tr><td>" + i++ + "</td>" +
		          "<td>" + (file.dname ? file.dname : file.fname) + "</td>" +
		          "<td>" + (xinfo.artist ? xinfo.artist : "") +"</td>" +
		          "<td>" + (file.runtime ? secondsToPrettyString(parseInt(file.runtime), true) : "") + "</td>" +
		          tdPlay +
		          tdBuy +
		          "</tr>");
		var trackEl = el.children().last();
		trackEl.data({track: file, name: name, url: IPFSUrl([xinfo['DHT Hash'], file.fname]), sugPlay: file.sugPlay, minPlay: file.minPlay, sugBuy: file.sugBuy, minBuy: file.minBuy});
	}
    });
    if (extraFiles.children().length < 1) {
        extraFiles.parent().hide();
    }

    $('.pwyw-item').off ('click');

    $('.pwyw-item').on ('click', function (e) {
		showPaymentOption(e);
    });

    $('.playlist td').on ('click', function (e) {
    	$('.playlist tr').removeClass('active');
    	$(e.target).closest('tr').addClass('active');
		showPaymentOption(e);
    });
}

function secondsToPrettyString (s, short){
    var duration = moment.duration(s, 's');
    var minutes = duration.minutes()<10 ? "0" + duration.minutes() : duration.minutes();
    var seconds = duration.seconds()<10 ? "0" + duration.seconds() : duration.seconds();
    if (short)
        return duration.hours() + ':' + minutes + ':' + seconds;
    return duration.hours() + ' hours ' + minutes + ' minutes ' + seconds + ' seconds';
}

function getPrices (file) {

    var prices = {
        play: {
            suggested: 0,
            min: 0
        },
        download: {
            suggested: 0,
            min: 0
        }
    };

    if (file.minBuy)
        prices.download.min = file.minBuy;

    if (file.sugBuy)
        prices.download.suggested = file.sugBuy;

    if (file.minPlay)
        prices.play.min = file.minPlay;

    if (file.sugPlay)
        prices.play.suggested = file.sugPlay;

    return prices;
}

function togglePlaybarShadow (bool) {
    var action = bool?'show':'hide';
    $('.jp-type-single')[action]();
    $('#audio-player')[action]();
    $('#embedded-file')[action]();
    $('#native-player')[action]();
    $('.playbar-shadow').toggleClass('hidden', bool);
	$('.buybox').toggleClass('hidden', bool);
}

function applyMediaData(data) {
    var media = data['alexandria-media'];
    var info = media.info;
    var xinfo = info['extra-info'];
    var payment = media.payment;
    var ipfsAddr = xinfo['DHT Hash'];

    var mediaInfoSel = $('.media-info');
    var releaseInfoSel = $('.release-info');
    var mediaDataSel = $('.media-data');
    var tracks = fixDataMess(xinfo);

    // This sets a global mainFile object to the main object.
    if (!xinfo['files']) {
    	xinfo['files'] = [];
		var i = 0;
		tracks.forEach( function (file) {
			xinfo['files'][i] = {
				fname: file,
				runtime: xinfo['runtime'],
				minBuy: 0,
				sugBuy: 0,
				minPlay: 0,
				sugPlay: 0,
			}
			if (payment) {
				xinfo['files'][i]['type'] = payment['type'];
				console.log('Artifact uses old payment format');
			}
			if (xinfo['pwyw']) {
		    	var pwywArray = xinfo['pwyw'].split(',');
				xinfo['files'][i]['sugBuy'] = parseFloat(pwywArray[0]);
				xinfo['files'][i]['sugPlay'] = parseFloat(pwywArray[1]);
				xinfo['files'][i]['minBuy'] = parseFloat(pwywArray[1]);
			} else {
				xinfo['files'][i]['sugBuy'] = 0;
				xinfo['files'][i]['sugPlay'] =  0;
				xinfo['files'][i]['minBuy'] =  0;
			}
			i++
		});
	}
    mainFile = {
        track: xinfo['files'][0],
        name: xinfo['files'][0].dname,
        url: IPFSUrl([xinfo['DHT Hash'], xinfo['files'][0].fname]),
        sugPlay: xinfo['files'][0].sugPlay,
        minPlay: xinfo['files'][0].minPlay,
        sugBuy: xinfo['files'][0].sugBuy,
        minBuy: xinfo['files'][0].minBuy
    };
    filetype = mainFile.track.fname.split('.')[mainFile.track.fname.split('.').length - 1].toLowerCase();
    console.info(filetype);
    mediaDataSel.data(media)

    // Set what the circles will use for pricing.
    if(!xinfo['files'][0].disallowPlay && xinfo['files'][0].sugPlay) {
    	$('.pwyw-action-play').show();
	    $('.pwyw-price-play').text (xinfo['files'][0].sugPlay);
	    $('.pwyw-price-suggest-play').text (xinfo['files'][0].sugPlay)
    } else {
    	$('.pwyw-action-play').hide();
    }
    if(!xinfo['files'][0].disallowBuy && xinfo['files'][0].sugBuy) {
    	$('#audio-player').hide();
    	$('.pwyw-action-download').show();
	    $('.pwyw-price-download').text (xinfo['files'][0].sugBuy)
	    $('.pwyw-price-suggest-download').text (xinfo['files'][0].sugBuy)
    } else {
    	$('.pwyw-action-download').hide();
    }

    // Set other meta info
    $('.media-artist', mediaInfoSel).text(xinfo.artist ? xinfo.artist : xinfo.creator ? xinfo.creator : "");
    $('.artifact-title', mediaInfoSel).text(info.title);
    $('#titlemeta').text(info.title);
    $('meta[name="description"]').attr('content', info.title);
    $('.ri-runtime', releaseInfoSel).text (secondsToPrettyString(parseInt(xinfo.runtime)));
    $('.ri-audio-count', releaseInfoSel).text (tracks.length);
    $('.ri-publisher', releaseInfoSel).text (media.publisher);
    $('.ri-btc-address', releaseInfoSel).text (xinfo['Bitcoin Address']);
    if (!xinfo['Bitcoin Address']) {
        getTradeBotBitcoinAddress(media.publisher, function(data){
            $('.ri-btc-address').html(data);
        });
    }
	if (xinfo.coverArt) {
    	$('.playbar-shadow').css('width','initial');
	    $('.media-cover img').attr('src', IPFSUrl ([ipfsAddr,  xinfo.coverArt]));
		$('.media-cover').css('width','50%').show();
		$('.media-info').css('width','50%');
	} else {
	    $('.media-cover').hide();
		$('.media-info').css('width','100%');
	}

    renderPlaylistFilesHTML(xinfo['files'], xinfo, $('.playlist-tracks'), media['type'], $('.playlist-extra-files'));

	posterFrame = getObjects(xinfo['files'], 'type', 'preview');
        posterFrame = (posterFrame[0]) ? (posterFrame[0]['fname']) : ('');
        if (posterFrame == '') {
        	posterFrame = 'alexandria-default-posterframe.png';
        }

    keepHash = (xinfo['DHT Hash']) ? (xinfo['DHT Hash']) : (media.torrent);

    console.log (media, tracks);

	var pubTime = media.timestamp;
	if (pubTime.toString().length == 10) {
		pubTime = media.timestamp * 1000;
	}

    $('.ri-date').text(moment(pubTime).format('MMMM Do YYYY'));

    $('.media-description').html(info.description.replace(/(?:\r\n|\r|\n)/g, '<br />'));

    watchForPin (ipfsAddr, xinfo.filename)

    return media;
}

function watchForPin (addr, filename) {
    if (window.pinWatcher)
        clearInterval (window.pinWatcher)

    var pinningSel = $('.pwyw-currently-pinning');
    window.pinWatcher = setInterval (function () {
        /* ToDo: Implement Pinning.
        $.ajax ({
            // XXX(xaiki): hardcoded Tiny Human.mp3
            url: window.librarianHost + '/api/ipfs/dht/findprovs/' + 'QmRb23uqmA3uJRUoDkRyG3qXvTpSV5a4zwe6yjJRsLZvAm'
        })
            .done(function (data) {
                var count = data.output.split('error:')[0].split(' ').length;
                pinningSel.text(count)
            })
            .fail(function () {

            })*/
    }, 2000)
}

function IPFSUrl (components) {
    return encodeURI (IPFSHost + '/ipfs/' + components.join ('/'));
}

function showPaymentOption(e) {
        var self = e.target;
        if( $(self).hasClass('disabled') ) {
        	return false;
        }
        var	fileData = $('.playlist tr.active').data();
        $('.media-track').hide();
        var btcAddress = $('.ri-btc-address').text();
        var price = 0;
        var sugPrice = 0;
        var actionElement;
        var action;

        // Check if we are the play or download button
        if ($(self).closest('td').hasClass('tb-price-download') || $(self).closest('li').hasClass('pwyw-action-download') || $(self).closest('tbody').hasClass('playlist-extra-files')){
            actionElement = $('.pwyw-activate-download');
            action = 'download';
            price = fileData.minBuy ? fileData.minBuy : 0;
            sugPrice = fileData.sugBuy ? fileData.sugBuy : 0;
        } else {
            actionElement = $('.pwyw-activate-play');
            action = 'play';
            price = fileData.minPlay ? fileData.minPlay : 0;
            sugPrice = fileData.sugPlay ? fileData.sugPlay : 0;
		}
        if (price === 0 || price === undefined || price == NaN){
            onPaymentDone(action, fileData);
            return;
        }

        if (!fileData.track.dname) {
            $('.media-track').text(fileData.track.fname);
        } else {
            $('.media-track').text(fileData.track.dname);
        }
        $('.media-track').show();
        togglePlaybarShadow(false);
        if (artifactLoaded === false) {
            artifactLoaded = true;
        } else {
            var btcprice = makePaymentToAddress(btcAddress, price, sugPrice, function () {
                return onPaymentDone(action, fileData);
            });
            console.info("Cost of artifact: " + btcprice);
            $('.pwyw-btc-' + action + '-price').text(btcprice);
            $('.pwyw-usd-' + action + '-price-input').val(sugPrice);

            $('.pwyw-container').removeClass('active');
            actionElement.addClass('active');

            // Coinbase BTC Code
            // If the price is between $1 and $5 then show the BTC buy widget
            console.log(btcAddress);
            console.log(price);
            if (sugPrice >= 1 && sugPrice <= 5){
                testDomain();
                createCoinbaseModal(btcAddress, sugPrice, action);
            } else {
                hideCoinbaseButton();
            }

            // Show paywall
            togglePWYWOverlay(true);
        }
}

function mountMediaBrowser(el, data) {
	var mediaPublisher = data[0]['publisher-name'];
	var mediaID = data[0]['txid'];
	var data = data[0]['media-data'];
    $(el).html($('#media-template').html());
    var mediaData = applyMediaData(data);
    getUSDdayAvg();
    var artifactType = mediaData['type'];
    if ( (artifactType === 'video') || (artifactType === 'movie') || (artifactType === 'music') ) {
        // Prep file types that use the built-in media player
        if ( (filetype == 'mp3') || (filetype == 'm4a') || (filetype == 'flac') ) {
    	    $('#audio-player').jPlayer({
    	        cssSelectorAncestor: "#playbar-container",
    	        swfPath: "/js",
    	        supplied: filetype,
    	        size: {
    	        	width: '820px'
    	        },
    	        useStateClassSkin: true,
    	        autoBlur: false,
    	        smoothPlayBar: true,
    	        keyEnabled: true,
    	        remainingDuration: true,
    	        toggleDuration: true,
    	        error: function (e) {
    	            console.error('got jplayer error', e)
    	        }
    	    })
    	} else if ( (filetype == 'mp4') || (filetype == 'm4v') ) {
    	    $('#audio-player').jPlayer({
    	        cssSelectorAncestor: "#playbar-container",
    	        swfPath: "/js",
    	        supplied: "m4v",
    	        size: {
    	        	width: '820px',
    	        	height: '461px'
    	        },
    	        useStateClassSkin: true,
    	        autoBlur: false,
    	        smoothPlayBar: true,
    	        keyEnabled: true,
    	        remainingDuration: true,
    	        toggleDuration: true,
    	        error: function (e) {
    	            console.error('got jplayer error', e)
    	        }
    	    })
    	} else if ( (filetype == 'ogg') || (filetype == 'oga') ) {
    	    $('#audio-player').jPlayer({
    	        cssSelectorAncestor: "#playbar-container",
    	        swfPath: "/js",
    	        supplied: "ogg,oga",
    	        size: {
    	        	width: '820px'
    	        },
    	        useStateClassSkin: true,
    	        autoBlur: false,
    	        smoothPlayBar: true,
    	        keyEnabled: true,
    	        remainingDuration: true,
    	        toggleDuration: true,
    	        error: function (e) {
    	            console.error('got jplayer error', e)
    	        }
    	    })
    	} else if (filetype == 'webm') {
    	    $('#audio-player').jPlayer({
    	        cssSelectorAncestor: "#playbar-container",
    	        swfPath: "/js",
    	        supplied: "webmv",
    	        size: {
    	        	width: '820px',
    	        	height: '461px'
    	        },
    	        useStateClassSkin: true,
    	        autoBlur: false,
    	        smoothPlayBar: true,
    	        keyEnabled: true,
    	        remainingDuration: true,
    	        toggleDuration: true,
    	        error: function (e) {
    	            console.error('got jplayer error', e)
    	        }
    	    })
    	} else if (filetype == 'ogv') {
    	    $('#audio-player').jPlayer({
    	        cssSelectorAncestor: "#playbar-container",
    	        swfPath: "/js",
    	        supplied: "ogv",
    	        size: {
    	        	width: '820px',
    	        	height: '461px'
    	        },
    	        useStateClassSkin: true,
    	        autoBlur: false,
    	        smoothPlayBar: true,
    	        keyEnabled: true,
    	        remainingDuration: true,
    	        toggleDuration: true,
    	        error: function (e) {
    	            console.error('got jplayer error', e)
    	        }
    	    })
       	} else {
            // Handle Artifact Types that don't use the built-in media player
    		$('.jp-title').text('Unsupported File Format');

    	}
    }

    $('.pwyw-usd-price-input').on('keyup', function (e) {
        var action = this.classList[1]
            .replace(/^pwyw-usd-/, '')
            .replace(/-price-input$/, '')

        $('.pwyw-btc-' + action + '-price').text (USDToBTC(this.value));
        if (lastAddress) {
            setQR(lastAddress, USDToBTC(this.value));

            // Update Coinbase modal!
            console.log(this.value);
            if (this.value >= 1 && this.value <= 5){
                createCoinbaseModal(lastAddress, this.value, action);
            } else {
                hideCoinbaseButton();
            }
        }

    })

    $('.pwyw-overlay').on('click',function() {
        togglePWYWOverlay(false);
    });
    $('.pwyw-close').on('click',function() {
        togglePWYWOverlay(false);
    });
    $('.pwyw-pin-it').on('click', function (e) {
        $.ajax({
            url: "http://localhost:8079/api/ipfs/pin/add/" + keepHash
        })
        .done(function (data) {
            if (data.status == "ok") {
                togglePlaybarShadow(true);
                $('.pwyw-close').trigger('click');
            } else if (data.status == "error") {
                if (data.error.indexOf('already pinned recursively') > -1) {
                    togglePlaybarShadow(true);
                    $('.pwyw-close').trigger('click');
                } else {
                    $('.pwyw-pining-error').text('An unknown error has occured, please make sure you have Librarian installed and running.').show();
                }
            } else {
                $('.pwyw-pining-error').text('An unknown error has occured, please make sure you have Librarian installed and running.').show();
            }
        })
        .fail(function() {
            $('.pwyw-pining-error').text('You must have Librarian installed and running in order to use this feature.').show();
        });
    })

    $('.format-selector button').on('click', function (e) {
        filetype = $(e.target).html();
        $('.format-selector button').removeClass('active');
        $(this).addClass('active')
    })

	displayEmbedCode(mediaID, mediaData.type, true);

	window.scroll(0,0);
	$('.playlist-tracks tr:first').children(':first').click();

	// MAKE HISTORY ARTIFACT VIEW
	var stateObj = {
		currentView: 'artifact',
		searchResults: false,
		subView: mediaID,
		artifactTitle: mediaData.info.title,
		mediaType: mediaData.type,
		artifactPublisher: mediaPublisher,
		publisherId: mediaData.publisher
	}
	makeHistory(stateObj, 'ΛLΞXΛNDRIΛ > Media > ' + stateObj.mediaType.charAt(0).toUpperCase() + stateObj.mediaType.slice(1) + ' > ' + stateObj.artifactTitle);
}

// EMBED ARTIFACT FROM DHT
function embedFile(mediaType, fileHash, mediaFilename, posterFrame) {
    var embedCode = '';
    if (mediaFilename == 'none') {
        mediaFilename = '';
    }
    if (mediaType == 'book') {
        embedCode = '<object data="' + IPFSHost +'/ipfs/'+ fileHash + '/' + mediaFilename + '" type="application/pdf" width="100%" height="800px" class="book-embed"><p>No PDF plugin installed. You can <a href="' + IPFSHost +'/ipfs/'+ fileHash +'">click here to download the PDF file.</a></p></object>'
    } else if (mediaType == 'thing') {
        embedCode = '<img src="' + IPFSHost +'/ipfs/'+fileHash+ '/' + mediaFilename +'" class="large-poster" />';
    } else {
        embedCode = '<object data="' + IPFSHost +'/ipfs/'+fileHash+'" type="text/html" width="100%" height="620px" />';
    }
    $('#embedded-file').html(embedCode).show();
}

function USDTouBTC (amount) {
    return (1000000*Number(amount)/day_avg).toString().substring(0, 16)
}

function USDToBTC (amount) {
    return Math.round((Number(amount)/day_avg).toString().substring(0, 16)*100000000)/100000000
}

function BTCtoUSD (amount) {
    return Math.round((Number(amount)*day_avg).toString().substring(0, 16)*100)/100
}

function loadTrack (name, url, fname) {
	fname = encodeURI(fname).replace('+', '%20');
	console.info(url + fname);
	var posterurl = url;
	if (posterFrame == 'alexandria-default-posterframe.png') {
		posterurl = IPFSHost+'/ipfs/QmQhoySfbL9j4jbDRSsZaeu3DACVBYW1o9vgs8aZAc5bLP/';
	}
	if (fname == 'none') {
		$('#audio-player').hide();
		if( $('#native-player') ) {
			$('#native-player').remove();
		}
		$('#playbar-container').hide().after('<video id="native-player" controls="controls" poster="' + posterurl + posterFrame +'" height="461px" width="820px"><source src="'+ url.slice(0,-1) + '" /></video>');
		return false;
	}
	$('#audio-player').show();
	if (filetype == 'mp3') {
	    $('#audio-player').jPlayer("setMedia", {
	        title: name,
	        mp3: url + fname
		});
	} else if (filetype == 'flac') {
	    $('#audio-player').jPlayer("setMedia", {
	        title: name,
	        flac: url + fname
		});
	} else if (filetype == 'm4a') {
	    $('#audio-player').jPlayer("setMedia", {
	        title: name,
	        m4a: url + fname
		});
	} else if ( (filetype == 'mp4') || (filetype == 'm4v') ) {
	    $('#audio-player').jPlayer("setMedia", {
	        title: name,
	        m4v: url + fname,
	        poster: posterurl + posterFrame
	    });
	} else if ( (filetype == 'ogg') || (filetype == 'oga') ) {
	    $('#audio-player').jPlayer("setMedia", {
	        title: name,
	        oga: url + fname,
	        poster: posterurl + posterFrame
	    });
	} else if (filetype == 'webm') {
	    $('#audio-player').jPlayer("setMedia", {
	        title: name,
	        webmv: url + fname,
	        poster: posterurl + posterFrame
	    });
	} else if (filetype == 'ogv') {
	    $('#audio-player').jPlayer("setMedia", {
	        title: name,
	        ogv: url + fname,
	        poster: posterurl + posterFrame
	    });
	} else if ( (filetype == 'mov')  || (filetype == 'mkv') || (filetype == 'avi') || (filetype == 'wav') ) {
		$('#audio-player').hide();
		if( $('#native-player') ) {
			$('#native-player').remove();
		}
		$('#playbar-container').hide().after('<video id="native-player" controls="controls" poster="' + posterurl + posterFrame +'" height="461px" width="820px"><source src="'+ url + fname +'" /></video>');
	}
}

function togglePWYWOverlay (bool) {
	$('.paybox-bitcoin').hide();
	$('#pwyw-btc-play-qrcode img').attr('src','');
	$('.pwyw-btc-address').text('');
    var action = bool?'show':'hide';
    $('.pwyw-close')[action]();
    $('.pwyw-overlay')[action]();
    $('.pwyw-paybox.paybox-first')[action]();
    $('.pwyw-close').appendTo('.pwyw-container.active');
	if (bool === false) {
		$('.pwyw-container.active').toggleClass('active');
	}
}

function toggleBitcoinPay (bool) {
    var action = bool?'show':'hide';
    $('.pwyw-paybox.paybox-first').hide();
	$('.paybox-bitcoin')[action]();
}

function onPaymentDone (action, file) {
    var url = file.url;

    if (action == 'pin') $('.pwyw-pining-error').hide();

    if (action != 'pin') {
        togglePWYWOverlay(false);
        togglePlaybarShadow(true);
    }

	console.info(file);

    var trackPath = file.url.slice(0, '-'+ encodeURI(file.track.fname).length);
    var res = loadTrack(file.track.dname, trackPath, file.track.fname);

    togglePlaybarShadow(true);
    if (action === 'download') {
        // Add a link to download
        var a = $("<a>").attr("href", url).attr("download", file.track.fname).attr("target","_blank").appendTo("body");
        // Click the link
        a[0].click();
        // Remove the link we added.
        a.remove();
        $('#playbar-container').show();
        $('#audio-player').jPlayer("load");
    } else {
        var fileType = file.track.type;
        if ( (fileType === 'video') || (fileType === 'movie') || (fileType === 'music') ) {
            // Use built-in media player for audio and video
            $('#playbar-container').show();
            if (artifactLoaded === false) {
                $('#playbar-container').jPlayer("load");
                artifactLoaded = true;
            } else {
                $('#audio-player').jPlayer("play");
            }
        } else {
            // Hide built-in media player
            $('#playbar-container').hide();
            // Embed static artifacts
            embedFile(fileType, trackPath.split('/')[4], file.track.fname, '');
        }
    }
}

$('#audio-player').click(function(){
	if ( $('#audio-player').jPlayer().data().jPlayer.status.paused == true ) {
		$('#audio-player').jPlayer("play");
	} else {
		$('#audio-player').jPlayer("pause");
	}
});

var lastAddress;

function makePaymentToAddress(address, minAmt, sugAmt, done) {
    togglePlaybarShadow(false);
    var amountInBTC = USDToBTC(minAmt);
    var params = { address: address, amount: amountInBTC };

    $.ajax({
        url: URL_RECV,
        data: params
    })
        .done(function (data, textStatus, jqXHR) {
            console.log("Payment address", data.input_address, "Amount:", sugAmt);
            lastAddress = data.input_address;
            setQR(data.input_address, USDToBTC(sugAmt));
            if (sugAmt >= 1 && sugAmt <= 5){
            	updateCoinbaseModal(data.input_address, sugAmt);
            }
            watchForpayment(data.input_address, minAmt, done);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.error(textStatus, errorThrown);
            setTimeout(makePaymentToAddress(address, minAmt, sugAmt, done), 5000);
        });

    return USDToBTC(sugAmt);
}

function getUSDdayAvg() {
    $.ajax({
        url: "https://api.bitcoinaverage.com/ticker/global/USD/"
    }).done(function (usddata) {
        day_avg = usddata['24h_avg'];
    });
}

var paymentTimeout;
var restartWebSocket = true;
var recievedPartial = false;
function watchForpayment(address, amount, done) {
    done = done || function () {};
    if (amount <= 0) {
        return done(amount);
    }

    bitcoinWebsocket = new WebSocket("wss://ws.blockchain.info/inv");

    bitcoinWebsocket.onopen = function(evt){
        console.log('Websocket Opened...');
        bitcoinWebsocket.send('{"op":"addr_sub", "addr":"' + address + '"}');
    }

    bitcoinWebsocket.onmessage = function(evt){
        var received_msg = evt.data;
        var message = JSON.parse(received_msg);
        if (message.op == "utx"){
            console.log(message);
            console.log("Recieved transaction, hash: " + message.x.hash);
            
            var bitsRecieved = 0;

            for (var i = 0; i < message.x.out.length; i++) {
                if (message.x.out[i].addr == address){
                    bitsRecieved = message.x.out[i].value;
                    console.log("Bits Recieved: " + bitsRecieved);
                }
            }

            // This converts it from bits to full Bitcoin (i.e. 13312 bits would become 0.00013312 BTC);
            var formattedBTCRecieved = bitsRecieved/100000000;

            // amountPaid is the value in USD recieved.
            var amountPaid = BTCtoUSD(formattedBTCRecieved);
            console.log("Recieved $" + amountPaid);

            var amountRequired = amount;

            if (amountPaid >= amountRequired){
                togglePlaybarShadow(true);
                done(amountPaid);

                restartWebSocket = false;
                bitcoinWebsocket.close();
            } else {
                recievedPartial = true;
            }
        }
    }

    bitcoinWebsocket.onclose = function(evt){
        // Sometimes the websocket will timeout or close, when it does just respawn the thread.
        console.log("Websocket Closed")

        if (restartWebSocket)
            setTimeout(function(){ watchForpayment(address, amount, done); }, 200);
    }
}

function setQR(address, amount) {
    // Reset the QR Code Div
    var qrCodes = ['pwyw-btc-play-qrcode', 'pwyw-btc-download-qrcode'];

    for (qrCodeId of qrCodes) {
        var parNode = document.getElementById(qrCodeId);
        while (parNode.firstChild) {
            parNode.removeChild(parNode.firstChild);
        }
    }

    if (amount) {
        $('.pwyw-btc-address').text(address);
        var qrOptions = {
             text: "bitcoin:" + address + "?amount=" + amount,
		     width: 300,
		     height: 300,
		     colorDark : "#000000",
		     colorLight : "#FFFFFF",
		     correctLevel : QRCode.CorrectLevel.H };

        for (qrCodeId of qrCodes) {
            var qrPlay = document.getElementById(qrCodeId);
            var qrcodePlay
            if (qrPlay) {
                qrcodePlay = new QRCode(qrPlay, qrOptions);
            }
        }

        $('.pwyw-qrcode img').each(function() {
            $(this).css('margin','auto');
        });
		$('#pwyw-btc-play-qrcode').show();
    }
}

// IFRAME EMBED CODE
function displayEmbedCode (mediaID, mediaType, isNew) {

    if ( isNew != true ) {
        // Use old embed html for old artifacts
        embedUrl = window.location.origin + window.location.pathname + 'embed.html#' + mediaID;
    } else {
        // Use new embed html for new artifacts
        embedUrl = window.location.origin + window.location.pathname + 'artifact.html#' + mediaID;
    }

    var iframeEmbedCode = '<iframe src="'+ embedUrl +'" width="800px" height="600px"></iframe>';
    $('.iframecode').text(iframeEmbedCode);
}