var filetype = 'mp3';
var day_avg = false;
var delay = 5000;
var keepHash;
var URL_RECV = "http://localhost:11306/payproc/api/receive";
var URL_GETRECVD = "http://192.241.219.201:11306/payproc/api/getreceivedbyaddress/";

window.doMountMediaBrowser = function (el, data) {
    console.log (el, data);
    $('.media-cover img').attr('src','');
    $('#audio-player').slideUp();
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

function renderPlaylistTracksHTML (tracks, prices, xinfo, el) {
	console.info(tracks.length);
    el.empty();
    var i = 1;
    var price = {
        play: prices.play.suggested?prices.play.suggested:"FREE!",
        download: prices.download.suggested?prices.download.suggested:"FREE!"
    }
    var trackTime = secondsToPrettyString(xinfo.runtime, true);
    if (tracks.length > 1) {
    	trackTime = '';
    }
    tracks.forEach (function (track) {
        var name = prettifyTrack(track, xinfo)
        el.append("<tr><td>" + i++ + "</td>" +
                  "<td>" + name + "</td>" +
                  "<td>" + xinfo.artist +"</td>" +
                  "<td>" + trackTime + "</td>" +
                  "<td><span class=\"price\">$<span class=\"price tb-price-play\">" + price.play + "</span></span></td>" +
                  "<td><span class=\"price\">$<span class=\"price tb-price-download\"><span>" + price.download + "</span></span></td>" +
                  "</tr>");
        var trackEl = el.children().last();
        trackEl.data({track: track, name: name, url: IPFSUrl([xinfo['DHT Hash'], track])});
    });

    $('.tb-price-play', el).on ('click', function () {
        $('.pwyw-action-play').click();
    })

    $('.tb-price-download', el).on ('click', function () {
        $('.pwyw-action-download').click();
    })

    $('.playlist-tracks tr').on ('click', function (e) {
        var el = $(this)
        var trackData = el.data();
        loadTrack (trackData.name, trackData.url)
        $('.playlist-tracks tr').removeClass ('selected');
        el.addClass('selected');
    })
    console.log (el, tracks);
    if (!xinfo.pwyw) {
        togglePlaybarShadow(true);
        var freePlayTimer = setTimeout("autoPlayFree()", 500);
    } else {
        togglePlaybarShadow(false);
    }
}

function autoPlayFree() {
	$('.playlist-tracks tr:first').click();
}

function secondsToPrettyString (s, short){
    var duration = moment.duration(s, 's');
    if (short)
        return duration.minutes() + ':' + duration.seconds();
    return duration.minutes() + ' minutes ' + duration.seconds() + ' seconds';
}

function getPrices (pwyw) {

    if (! pwyw) {
        return  {
            play: {
                suggested: 0,
                min: 0
            },
            download: {
                suggested: 0,
                min: 0
            }
        }
    }

    var pricesArray = pwyw.split(',')

    return {
        play: {
            suggested: pricesArray[0]/100,
            min: pricesArray[1]/100
        },
        download: {
            suggested: pricesArray[0],
            min: pricesArray[1]
        }
    }

}

function togglePlaybarShadow (bool) {
    $('.playbar-shadow').toggleClass('hidden', bool);
	$('.buybox').toggleClass('hidden', bool);
}

function applyMediaData(data) {
    var media = data['alexandria-media'];
    var info = media.info;
    var xinfo = info['extra-info'];
	filetype = xinfo.filename.split('.')[xinfo.filename.split('.').length - 1];
	console.log(filetype);
    var payment = media.payment;
    var ipfsAddr = xinfo['DHT Hash'];

    var mediaInfoSel = $('.media-info');
    var releaseInfoSel = $('.release-info');
    var mediaDataSel = $('.media-data');
    var tracks = fixDataMess(xinfo);

    var prices = getPrices (xinfo.pwyw)

    mediaDataSel.data(media)

    $('.pwyw-price-play').text (prices.play.suggested)
    $('.pwyw-price-suggest-play').text (prices.play.suggested)
    $('.pwyw-price-download').text (prices.download.suggested)
    $('.pwyw-price-suggest-download').text (prices.download.suggested)

    $('.media-artist', mediaInfoSel).text(xinfo.artist);
    $('.media-title', mediaInfoSel).text(info.title)
    $('.ri-runtime', releaseInfoSel).text (secondsToPrettyString(xinfo.runtime))
    $('.ri-audio-count', releaseInfoSel).text (tracks.length);
    $('.ri-publisher', releaseInfoSel).text (media.publisher);
    $('.ri-btc-address', releaseInfoSel).text (xinfo['Bitcoin Address']);
	if (xinfo.coverArt) {
    	$('.playbar-shadow').css('width','initial');
	    $('.media-cover img').attr('src', IPFSUrl ([ipfsAddr,  xinfo.coverArt]));
		$('.media-cover').show();
	} else {
	    $('.media-cover').hide();
    	$('.playbar-shadow').css('width','100%');
	}
    renderPlaylistTracksHTML(tracks, prices, xinfo, $('.playlist-tracks'))

    keepHash = media.torrent;

    console.log (media, tracks);

	var pubTime = media.timestamp;
	if (pubTime.toString().length == 10) {
		pubTime = media.timestamp * 1000;
	}	

    $('.ri-date').text(moment(pubTime).format('MMMM Do YYYY'));

    $('.media-description').text(info.description);

    watchForPin (ipfsAddr, xinfo.filename)
    //             debugger;

    return media;
}

function watchForPin (addr, filename) {
    if (window.pinWatcher)
        clearInterval (window.pinWatcher)

    var pinningSel = $('.pwyw-currently-pinning');
    window.pinWatcher = setInterval (function () {
        $.ajax ({
            // XXX(xaiki): hardcoded Tiny Human.mp3
            url: window.librarianHost + '/api/ipfs/dht/findprovs/' + 'QmRb23uqmA3uJRUoDkRyG3qXvTpSV5a4zwe6yjJRsLZvAm'
        })
            .done(function (data) {
                var count = data.output.split('error:')[0].split(' ').length;
                pinningSel.text(count)
            })
            .fail(function () {

            })
    }, 2000)
}

function IPFSUrl (components) {
    return encodeURI (IPFSHost + '/' + components.join ('/'));
}

function showPaymentOption(e) {
        var self = this;
        $('.pwyw-item').removeClass('active');

        for (i = 0; this.classList[i]; i++) {
            className = this.classList[i];
            if (className.match(/pwyw-action/)) {

                var action = className.replace(/^pwyw-action-/, '');
                var actionElement = $('.pwyw-activate-' + action);
                var price = $('.pwyw-suggested-price', actionElement).text();
    
                $('.pwyw-' + action + '-price').text(price);
                if (actionElement.hasClass('active')) {
                    return $('.pwyw-container').removeClass('active');
                }
    
                var btcAddress = $('.ri-btc-address').text();
                var btcprice = makePaymentToAddress(btcAddress, price, function () {
                    return onPaymentDone(action, $('.media-data').data());
                });
                $('.pwyw-btc-' + action + '-price').text(btcprice);
                $('.pwyw-usd-' + action + '-price-input').val(price);
                $('.pwyw-container').removeClass('active');
                actionElement.addClass('active');
                $(self).addClass('active')
    
                console.log ('btc', btcprice, 'pwyw-btc-' + action + '-price');
            }
        }
        togglePWYWOverlay(true)
}

function mountMediaBrowser(el, data) {
	var mediaPublisher = data[0]['publisher-name'];
	var mediaID = data[0]['txid'];
	var data = data[0]['media-data'];
    $(el).html($('#media-template').html())
    var mediaData = applyMediaData(data)
    getUSDdayAvg();
	if ( (filetype == 'mp3') || (filetype == 'm4a') ) {
	    $('#audio-player').jPlayer({
	        cssSelectorAncestor: "#playbar-container",
	        swfPath: "/js",
	        supplied: filetype,
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
	        	height: '547px'
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
	        	height: '547px'
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
        togglePWYWOverlay(false)
    });
    $('.pwyw-close').on('click',function() {
        $('.pwyw-item.active').trigger('click');
        togglePWYWOverlay(false)
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

function loadTrack (name, url) {
	if ( (filetype == 'mp3') || (filetype == 'm4a') ) {
	    $('#audio-player').jPlayer("setMedia", {
	        title: name,
	        mp3: url
	    });
	} else if ( (filetype == 'mp4') || (filetype == 'm4v') ) {
	    $('#audio-player').jPlayer("setMedia", {
	        title: name,
	        m4v: url
	    });
	    $('#audio-player').slideDown('slow');
	} else if (filetype == 'webm') {
	    $('#audio-player').jPlayer("setMedia", {
	        title: name,
	        webmv: url
	    });
	    $('#audio-player').slideDown('slow');
	}
    if ($('.playbar-shadow:visible').length == 0) {
	    $('#audio-player').jPlayer("play");
    }
}

function togglePWYWOverlay (bool) {
    var action = bool?'show':'hide';

    $('.pwyw-close')[action]();
    $('.pwyw-overlay')[action]();
}

function onPaymentDone (action, media) {
    var xinfo = media.info['extra-info'];
    var selectedTrackData = $('.playlist-tracks tr.selected').data();
    var url = selectedTrackData?
        selectedTrackData.url:
        IPFSUrl ([xinfo['DHT Hash'], xinfo.filename]);
    resetQR();

    if (action == 'pin') $('.pwyw-pining-error').hide();

    if ($('.pwyw-item.active').length > 0 && action != 'pin') {
        $('.pwyw-item.active').trigger('click');
        togglePWYWOverlay(false)
        togglePlaybarShadow(true);
    }

    var res = loadTrack (xinfo.filename, url);
    $('#audio-player').jPlayer("play");

    if (action === 'download') {
        document.getElementById('my_iframe').src = url;
    }

    console.log ('player', res, IPFSUrl ([xinfo['DHT Hash'], xinfo.filename]));
}

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
        console.log(day_avg)
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
                console.log('not paid checking again.');
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
