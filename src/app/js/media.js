var day_avg = false;
var delay = 5000;
var keepHash;
var mainFile;
var URL_RECV = window.location.protocol+"//api.alexandria.io/payproc/api/receive";
var URL_GETRECVD = window.location.protocol+"//api.alexandria.io/payproc/api/getreceivedbyaddress/";

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

function renderPlaylistFilesHTML (files, xinfo, el) {
    // Remove all current elements
    el.empty();
    var i = 1;

    var trackTime = secondsToPrettyString(parseInt(xinfo.runtime), true);
    if (files.length > 1) {
    	trackTime = '';
    }
    console.log(files);
    files.forEach (function (file) {
        // If we are the preview image or an extra file, do not add it to the table for now.
        // ToDo: Add new table for extra files.
        // ToDo: Check for all different file types once implemented
        if (file.type == 'preview' || file.type == 'extra')
            return;

        el.append("<tr><td>" + i++ + "</td>" +
                  "<td>" + (file.dname ? file.dname : file.fname) + "</td>" +
                  "<td>" + (xinfo.artist ? xinfo.artist : "") +"</td>" +
                  "<td>" + (file.runtime ? secondsToPrettyString(parseInt(file.runtime), true) : "") + "</td>" +
                  "<td><span class=\"price\">$<span class=\"price tb-price-play\">" + (file.sugPlay ? file.sugPlay : "Free!") + "</span></span></td>" +
                  "<td><span class=\"price\">$<span class=\"price tb-price-download\"><span>" + (file.sugBuy ? file.sugBuy : "Free!") + "</span></span></td>" +
                  "</tr>");
        var trackEl = el.children().last();
        trackEl.data({track: file, name: name, url: IPFSUrl([xinfo['DHT Hash'], file.fname]), sugPlay: file.sugPlay, minPlay: file.minPlay, sugBuy: file.sugBuy, minBuy: file.minBuy});
    });

    $('.playlist-tracks tr').on ('click', function (e) {
        var el = $(this)
        var trackData = el.data();
        var trackPath = trackData.url.slice(0, '-'+escape(trackData.track.fname).length);
        var posterFrame = getObjects(files, 'type', 'preview');
        posterFrame = (posterFrame[0]) ? (posterFrame[0]['fname']) : ('');
        if (posterFrame == '') {
        	posterFrame = 'alexandria-default-posterframe.png';
        }
		if ($('.tb-price-play', el).text() == 'Free!') {
	        loadTrack (trackData.name, trackPath, trackData.track.fname, posterFrame);
	        $('.playlist-tracks tr').removeClass ('selected');
	        el.addClass('selected');
		}
    })

    $('.tb-price-play', el).on ('click', showPaymentOption);

    $('.tb-price-download', el).on ('click', showPaymentOption);

    if (!files[0].sugPlay) {
        togglePlaybarShadow(true);
        var freePlayTimer = setTimeout("autoPlayFree()", 500);
	    $('.jp-type-single').show();
	    $('#audio-player').show();
	    $('#native-player').show();
    } else {
	    $('#audio-player').hide();
	    $('#native-player').hide();
        togglePlaybarShadow(false);
    }
}

function autoPlayFree() {
	$('.playlist-tracks tr:first').click();
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
    $('.playbar-shadow').toggleClass('hidden', bool);
	$('.buybox').toggleClass('hidden', bool);
}

function applyMediaData(data) {
    var media = data['alexandria-media'];
    var info = media.info;
    var xinfo = info['extra-info'];
	filetype = xinfo.filename.split('.')[xinfo.filename.split('.').length - 1].toLowerCase();
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
    mediaDataSel.data(media)

    // Set what the circles will use for pricing.
    if(xinfo['files'][0].sugPlay) {
    	$('.pwyw-action-play').show();
	    $('.pwyw-price-play').text (xinfo['files'][0].sugPlay);
	    $('.pwyw-price-suggest-play').text (xinfo['files'][0].sugPlay)
    } else {
    	$('.pwyw-action-play').hide();
    }
    if(xinfo['files'][0]. sugBuy) {
    	$('#audio-player').hide();
    	$('.pwyw-action-download').show();
	    $('.pwyw-price-download').text (xinfo['files'][0].sugBuy)
	    $('.pwyw-price-suggest-download').text (xinfo['files'][0].sugBuy)
    } else {
    	$('.pwyw-action-download').hide();
    }

    // Set other meta info
    $('.media-artist', mediaInfoSel).text(xinfo.artist ? xinfo.artist : "");
    $('.artifact-title', mediaInfoSel).text(info.title)
    $('.ri-runtime', releaseInfoSel).text (secondsToPrettyString(parseInt(xinfo.runtime)))
    $('.ri-audio-count', releaseInfoSel).text (tracks.length);
    $('.ri-publisher', releaseInfoSel).text (media.publisher);
    $('.ri-btc-address', releaseInfoSel).text (xinfo['Bitcoin Address']);
	if (xinfo.coverArt) {
    	$('.playbar-shadow').css('width','initial');
	    $('.media-cover img').attr('src', IPFSUrl ([ipfsAddr,  xinfo.coverArt]));
		$('.media-cover').css('width','50%').show();
		$('.media-info').css('width','50%');
	} else {
	    $('.media-cover').hide();
		$('.media-info').css('width','100%');
	}

    renderPlaylistFilesHTML(xinfo['files'], xinfo, $('.playlist-tracks'))

    keepHash = (xinfo['DHT Hash']) ? (xinfo['DHT Hash']) : (media.torrent);

    console.log (media, tracks);

	var pubTime = media.timestamp;
	if (pubTime.toString().length == 10) {
		pubTime = media.timestamp * 1000;
	}	

    $('.ri-date').text(moment(pubTime).format('MMMM Do YYYY'));

    $('.media-description').html(info.description.replace(/(?:\r\n|\r|\n)/g, '<br />'));

    watchForPin (ipfsAddr, xinfo.filename)
    //             debugger;

    return media;
}

// DISPLAY TIP MODAL
function loadTipModal(obj) {
	if ($(obj).parents('.entity-market #tip-modal').length == 0) {
		$(obj).parents('.entity-market').append($('#tip-modal'));
	}
	$('input[name="tip-amount"]:eq(2)').click();
	var mediaFLO = $('main:visible .FLO-address').html();
	if (!mediaFLO) {
		var mediaFLO = $('.ri-publisher').text();
	}
	var mediaBTC = $('main:visible .BTC-address').html();
	if (!mediaBTC) {
		var mediaBTC = $('.ri-btc-address').text();
	}
	$('#tipAdd-FLO').html(mediaFLO);
	// GENERATE QR CODE FOR FLO TIPS
	generateQR(mediaFLO, 'tip-QR', 100, 100, 'florincoin');
	if (document.getElementById('sendTipBtn')) {
		document.getElementById('sendTipBtn').setAttribute('onclick','sendTip(this, FLOclient, "' + mediaFLO + '", "FLO")');
	}
	if ( (mediaBTC != 'BTC address') && (mediaBTC != '') ) {
		$('#tipAdd-BTC').html(mediaBTC);
		$('.modal-tabs li[name="tip-bitcoin"]').removeClass('hidden');
		generateQR(mediaBTC, 'BTC-tip-QR', 100, 100, 'bitcoin');
		if (document.getElementById('sendBTCTipBtn')) {
			document.getElementById('sendBTCTipBtn').setAttribute('onclick','sendTip(this, BTCclient, "' + mediaBTC + '", "BTC")');
		}
	} else {
		$('#tipAdd-BTC').text('No Address Available');
		$('.modal-tabs li[name="tip-bitcoin"]').addClass('hidden');
	}
	$('#tip-modal .modal-tabs li').not('.hidden').first().click();
	var modalPos = (history.state.currentView == 'artifact') ? ('right') : ('left');
	var tipModalPos = (history.state.currentView == 'artifact') ? ($(obj).parent().width() - $(obj).position().left - 32) : ($(obj).position().left - 50);
	$(obj).parents('.entity-market').find('#tip-modal').css(modalPos,tipModalPos+'px').fadeToggle(fadeTimer);
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
        var self = this;
        // Hacky get data using lots of parents.
        var fileData = $(this).parent().parent().parent().data();
        console.log(fileData);

        // Check if fileData is an empty object, if it is, then fill it with the main file info as it is most likely that the circular buttons were pressed
        if (jQuery.isEmptyObject(fileData))
            fileData = mainFile;

        console.log(fileData)
        
        var btcAddress = $('.ri-btc-address').text();
        var price = 0;
        var actionElement;
        var action;

        $('.pwyw-item').removeClass('active');
        // Check if we are the play or download button
        if ($(this).hasClass('tb-price-play') || $(this).hasClass('pwyw-action-play')){
            actionElement = $('.pwyw-activate-play');
            action = 'play';
            price = fileData.sugPlay;
        }

        if ($(this).hasClass('tb-price-download') || $(this).hasClass('pwyw-action-download')){
            actionElement = $('.pwyw-activate-download');
            action = 'download';
            price = fileData.sugBuy;
        }

        if (actionElement.hasClass('active')) {
//            return $('.pwyw-container').removeClass('active');
        }

        if (price === 0 || price === undefined || price == NaN){
            onPaymentDone(action, fileData);
            return;
        }

        var btcprice = makePaymentToAddress(btcAddress, price, function () {
            return onPaymentDone(action, fileData);
        });
        $('.pwyw-btc-' + action + '-price').text(btcprice);
        $('.pwyw-usd-' + action + '-price-input').val(price);

        $('.pwyw-container').removeClass('active');
        actionElement.addClass('active');
        //$(self).addClass('active');

        togglePWYWOverlay(true);
}

function mountMediaBrowser(el, data) {
	var mediaPublisher = data[0]['publisher-name'];
	var mediaID = data[0]['txid'];
	var data = data[0]['media-data'];
    $(el).html($('#media-template').html());
    var mediaData = applyMediaData(data)
    getUSDdayAvg();
	if ( (filetype == 'mp3') || (filetype == 'm4a') ) {
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
		$('.jp-title').text('Unsupported File Format');
	}

    $('.pwyw-usd-price-input').on('keyup', function (e) {
        var action = this.classList[1]
            .replace(/^pwyw-usd-/, '')
            .replace(/-price-input$/, '')

        $('.pwyw-btc-' + action + '-price').text (USDToBTC(this.value))
        if (lastAddress) {
            setQR(lastAddress, USDToBTC(this.value));
        }

    })

    $('.pwyw-item').on('click', showPaymentOption)

    $('.pwyw-overlay').on('click',function() {
        $('.pwyw-item.active').trigger('click');
        $('.pwyw-container.active').removeClass('active');
        togglePWYWOverlay(false);
    });
    $('.pwyw-close').on('click',function() {
        $('.pwyw-item.active').trigger('click');
        $('.pwyw-container.active').removeClass('active');
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

function USDTouBTC (amount) {
    return (1000000*Number(amount)/day_avg).toString().substring(0, 16)
}

function USDToBTC (amount) {
    return Math.round((Number(amount)/day_avg).toString().substring(0, 16)*100000000)/100000000
}

function BTCtoUSD (amount) {
    return Math.round((Number(amount)*day_avg).toString().substring(0, 16)*100)/100
}

function loadTrack (name, url, fname, poster) {
	fname = encodeURI(fname);
	console.info(url + fname);
	var posterurl = url;
	if (poster == 'alexandria-default-posterframe.png') {
		posterurl = IPFSHost+'/ipfs/QmQhoySfbL9j4jbDRSsZaeu3DACVBYW1o9vgs8aZAc5bLP/';
	}
	if (fname == 'none') {
		$('#audio-player').hide();
		if( $('#native-player') ) {
			$('#native-player').remove();
		}
		$('#playbar-container').hide().after('<video id="native-player" controls="controls" autoplay poster="' + posterurl + poster +'" height="461px" width="820px"><source src="'+ url.slice(0,-1) + '" /><param name="autoplay" value="true" /></video>');
		return false;
	}
	$('#audio-player').show();
	if ( (filetype == 'mp3') || (filetype == 'm4a') ) {
	    $('#audio-player').jPlayer("setMedia", {
	        title: name,
	        mp3: url + fname
		});
	} else if ( (filetype == 'mp4') || (filetype == 'm4v') ) {
	    $('#audio-player').jPlayer("setMedia", {
	        title: name,
	        m4v: url + fname,
	        poster: posterurl + poster
	    });
	} else if ( (filetype == 'ogg') || (filetype == 'oga') ) {
	    $('#audio-player').jPlayer("setMedia", {
	        title: name,
	        oga: url + fname,
	        poster: posterurl + poster
	    });
	} else if (filetype == 'webm') {
	    $('#audio-player').jPlayer("setMedia", {
	        title: name,
	        webmv: url + fname,
	        poster: posterurl + poster
	    });
	} else if (filetype == 'ogv') {
	    $('#audio-player').jPlayer("setMedia", {
	        title: name,
	        ogv: url + fname,
	        poster: posterurl + poster
	    });
	} else if ( (filetype == 'mov')  || (filetype == 'mkv') || (filetype == 'avi') || (filetype == 'wav') ) {
		$('#audio-player').hide();
		if( $('#native-player') ) {
			$('#native-player').remove();
		}
		$('#playbar-container').hide().after('<video id="native-player" controls="controls" poster="' + posterurl + poster +'" height="461px" width="820px"><source src="'+ url + fname +'" /><param name="autoplay" value="true" /></video>');
	}
}

function togglePWYWOverlay (bool) {
    var action = bool?'show':'hide';

    $('.pwyw-close')[action]();
    $('.pwyw-overlay')[action]();
}

function onPaymentDone (action, file) {
    var url = file.url;
    resetQR();

    if (action == 'pin') $('.pwyw-pining-error').hide();

    if (action != 'pin') {
        //$('.pwyw-item.active').trigger('click');
        $('.pwyw-container.active').removeClass('active');
        togglePWYWOverlay(false)
        togglePlaybarShadow(true);
    }

    var res = loadTrack(file.track.fname, url);

    if (action === 'download') {
        // Add a link to download
        var a = $("<a>").attr("href", url).attr("download", file.track.fname).appendTo("body");
        // Click the link
        a[0].click();  
        // Remove the link we added.
        a.remove();
    }
    $('.jp-type-single').show();
    $('#audio-player').show();
    $('#audio-player').jPlayer("play");
}

$('#audio-player').click(function(){
	if ( $('#audio-player').jPlayer().data().jPlayer.status.paused == true ) {
		$('#audio-player').jPlayer("play");
	} else {
		$('#audio-player').jPlayer("pause");
	}
});

var lastAddress;

function makePaymentToAddress(address, amount, done) {
    resetQR();
    togglePlaybarShadow(false);
    var amountInBTC = USDToBTC(amount);
    var params = { address: address, amount: amountInBTC };

    $.ajax({
        url: URL_RECV,
        data: params
    })
        .done(function (data, textStatus, jqXHR) {
            console.log(data.input_address);
            lastAddress = data.input_address;
            setQR(data.input_address, USDToBTC(amount));
            watchForpayment(data.input_address, amount, done);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.error(textStatus);
        });

    return USDToBTC(amount);
}

function getUSDdayAvg() {
    $.ajax({
        url: "https://api.bitcoinaverage.com/ticker/global/USD/"
    }).done(function (usddata) {
        day_avg = usddata['24h_avg'];
        //console.log(day_avg)
    });
}

var paymentTimeout;
function watchForpayment(address, amount, done) {
    done = done || function () {};
    if (amount <= 0) {
        return done(amount);
    }

    $.ajax({
        url: URL_GETRECVD + address
    })
        .done(function (data) {
            if (!day_avg) {
                if (paymentTimeout) {
                    clearTimeout (paymentTimeout)
                }
                paymentTimeout = setTimeout(function () {
                    watchForpayment(address, amount, done);
                }, delay);
                return false;
            }
            var amountpaid = BTCtoUSD(data)  // data is expected to be BTC...for now
            console.log(amountpaid);
            var amountRequired = amount;
            if (amountpaid < amountRequired) {
                //console.log('not paid checking again.');
                if (paymentTimeout) {
                    clearTimeout (paymentTimeout)
                }
                paymentTimeout = setTimeout(function () {
                    watchForpayment(address, amount, done);
                }, delay);
                return true;
            }

            console.log('payed.');
            togglePlaybarShadow(true);
            done(amountpaid);
        });
}

function resetQR() {
    $('.pwyw-qrcode img').attr("src", 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==');

    $('.pwyw-btc-address').text('');   
}

function setQR(address, amount) {
    if (amount) {
        var url = "http://api.qrserver.com/v1/create-qr-code/?size=300x300&data=bitcoin:" + address + "?amount=" + amount;
        $('.pwyw-qrcode img').attr("src", url);
        $('.pwyw-btc-address').text(address);
    }
}