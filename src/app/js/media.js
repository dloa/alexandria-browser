var filetype = 'mp3';
var day_avg = false;
var delay = 5000;
var keepHash;

window.doMountMediaBrowser = function (el, data) {
    console.log (el, data)
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
    el.empty();
    var i = 1;
    var price = {
        play: prices.play.suggested?prices.play.suggested:"FREE!",
        download: prices.download.suggested?prices.download.suggested:"FREE!"
    }
    tracks.forEach (function (track) {
        var name = prettifyTrack(track, xinfo)
        el.append("<tr><td>" + i++ + "</td>" +
                  "<td>" + name + "</td>" +
                  "<td>" + xinfo.artist +"</td>" +
                  "<td>" + secondsToPrettyString(xinfo.runtime, true) + "</td>" +
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
                suggested: 0.0125,
                min: 0
            },
            download: {
                suggested: 1,
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
    if (bool) {
        $('#audio-player').jPlayer("play");
    }
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

    var prices = getPrices (xinfo.pwyw)

    if (!xinfo.pwyw) {
        togglePlaybarShadow(false);
    }

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

    $('.media-cover img').attr('src', IPFSUrl ([ipfsAddr,  xinfo.coverArt]));
    renderPlaylistTracksHTML(tracks, prices, xinfo, $('.playlist-tracks'))

    keepHash = media.torrent;

    console.log (media, tracks);
    
    $('.ri-date').text(moment(media.timestamp).format('MMMM Do YYYY'));
    //             debugger;

    return media;
}

function IPFSUrl (components) {
    return encodeURI (IPFSHost + '/' + components.join ('/'));
}

function showPaymentOption(e) {
        var self = this;
        $('.pwyw-item').removeClass('active');
        this.classList.forEach(function (className) {
            if (!className.match(/pwyw-action/))
                return

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
        });
        $('.pwyw-overlay').show();
        $('.pwyw-close').show();
}

function mountMediaBrowser(el, data) {
    $(el).html($('#media-template').html())
    var mediaData = applyMediaData(data)
    getUSDdayAvg();

    $('#audio-player').jPlayer({
        cssSelectorAncestor: "#playbar-container",
        swfPath: "/js",
        supplied: "mp3",
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
        $('.pwyw-close').hide();
        $('.pwyw-overlay').hide();
    });
    $('.pwyw-close').on('click',function() {
        $('.pwyw-item.active').trigger('click');
        $('.pwyw-close').hide();
        $('.pwyw-overlay').hide();
    });
    $('.pwyw-pin-it').on('click', function (e) {
        $.ajax({
            url: "http://localhost:8079/api/ipfs/pin/add/" + keepHash
        })
        .done(function (data) {
            libData = JSON.parse(data);
            console.log(libData);
            if (libData.status == "ok") {
                togglePlaybarShadow(true);
                $('.pwyw-close').trigger('click');
            } else if (libData.status == "error") {
                if (libData.error.indexOf('already pinned recursively') > -1) {
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
}

function USDTouBTC (amount) {
    return (1000000*Number(amount)/day_avg).toString().substring(0, 16)
}

function USDToBTC (amount) {
    return (Number(amount)/day_avg).toString().substring(0, 16)
}

function loadTrack (name, url) {
    $('#audio-player').jPlayer("setMedia", {
        title: name,
        mp3: url
    })
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
        $('.pwyw-close').hide();
        $('.pwyw-overlay').hide();
        togglePlaybarShadow(true);
    }

    var res = loadTrack (xinfo.filename, url)

    if (action === 'download') {
        document.getElementById('my_iframe').src = url;
    }

    console.log ('player', res, IPFSUrl ([xinfo['DHT Hash'], xinfo.filename]))
}

var lastAddress;

function makePaymentToAddress(address, amount, done) {
    resetQR();
    togglePlaybarShadow(false);
    $.ajax({
        url: "https://blockchain.info/api/receive?method=create&address=" + address
    })
        .done(function (data) {
            console.log(data.input_address);
            lastAddress = data.input_address;
            setQR(data.input_address, USDToBTC(amount));
            watchForpayment(data.input_address, amount, done);
        });

    return Math.round(USDToBTC(amount)*100000000)/100000000;
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
        url: "https://blockchain.info/q/getreceivedbyaddress/" + address
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
            var amountpaid = USDToBTC(data)
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
            done(amountpaid)
        });
}

function resetQR() {
    $('.pwyw-qrcode img').attr("src", 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==');

    $('.pwyw-btc-address').text('');
    
}

function setQR(address, amount) {
    amount = Math.round(amount*100000000)/100000000;
    if (amount) {
        var url = "http://api.qrserver.com/v1/create-qr-code/?size=300x300&data=bitcoin:" + address + "?amount=" + amount;
        $('.pwyw-qrcode img').attr("src", url);
    
        $('.pwyw-btc-address').text(address);
    }
}
