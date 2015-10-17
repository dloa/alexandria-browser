var filetype = 'mp3';
var day_avg = false;
var delay = 5000;

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
        .replace (/\.(mp3|flac)$/, '');
}

function renderPlaylistTracksHTML (tracks, xinfo, el) {
    el.empty();
    var i = 1;
    tracks.forEach (function (track) {
        track = prettifyTrack(track, xinfo)
        el.append("<tr><td>" + i++ + "</td>" +
                  "<td>" + track + "</td>" +
                  "<td>" + xinfo.artist +"</td>" +
                  "<td>" + secondsToPrettyString(xinfo.runtime, true) + "</td>" +
                  "<td><span class=\"price\">$<span class=\"price price-play\">0.0125</span></span></td>" +
                  "<td><span class=\"price\">$<span class=\"price price-download\"><span>1.00</span></span></td>" +
                  "</tr>")
    });

    console.log (el, tracks);
}

function secondsToPrettyString (s, short){
    var duration = moment.duration(s, 's');
    if (short)
        return duration.minutes() + ':' + duration.seconds();
    return duration.minutes() + ' minutes ' + duration.seconds() + ' seconds';
}

function applyMediaData(data) {
    var res = data.response;
    var media = res[0]['media-data']['alexandria-media'];
    var info = media.info;
    var xinfo = info['extra-info'];
    var payment = media.payment;
    var ipfsAddr = xinfo['DHT Hash'];

    var mediaInfoSel = $('.media-info');
    var releaseInfoSel = $('.release-info');
    var tracks = fixDataMess(xinfo);
    var pricesArray = xinfo.pwyw.split(',')

    var prices = {
        play: {
            suggested: pricesArray[0]/100,
            min: pricesArray[1]/100
        },
        download: {
            suggested: pricesArray[0],
            min: pricesArray[1]
        }
    }

    $('.pwyw-price-play').text (prices.play.min)
    $('.pwyw-price-suggest-play').text (prices.play.suggested)
    $('.pwyw-price-download').text (prices.download.min)
    $('.pwyw-price-suggest-download').text (prices.download.suggested)

    $('.media-artist', mediaInfoSel).text(xinfo.artist);
    $('.media-title', mediaInfoSel).text(info.title)
    $('.ri-runtime', releaseInfoSel).text (secondsToPrettyString(xinfo.runtime))
    $('.ri-audio-count', releaseInfoSel).text (tracks.length);
    $('.ri-publisher', releaseInfoSel).text (media.publisher);
    $('.ri-btc-address', releaseInfoSel).text (xinfo['Bitcoin Address']);

    $('.media-cover img').attr('src', IPFSHost + ipfsAddr + '/' + xinfo.coverArt);
    renderPlaylistTracksHTML(tracks, xinfo, $('.playlist-tracks'))
    console.log (media, tracks);
    //             debugger;

    return media;
}

function mountMediaBrowser(el, data) {
    $(el).html($('#media-template').html())
    var mediaData = applyMediaData(data)
    getUSDdayAvg();

    $('.pwyw-usd-price-input').on('keyup', function (e) {
        var action = this.classList[1]
            .replace(/^pwyw-usd-/, '')
            .replace(/-price-input$/, '')

        $('.pwyw-btc-' + action + '-price').text (USDTouBTC(this.value))
    })

    $('.pwyw-item').on('click', function (e) {
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
                return onPaymentDone(mediaData);
            });
            $('.pwyw-btc-' + action + '-price').text(btcprice);
            $('.pwyw-usd-' + action + '-price-input').val(price);
            $('.pwyw-container').removeClass('active');
            actionElement.addClass('active');
            $(self).addClass('active')

            console.log ('btc', btcprice, 'pwyw-btc-' + action + '-price')
        })
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

function onPaymentDone (media) {
    resetQR();

    $('#audio-player').jPlayer("setMedia", {
        title: "Bubble",
        m4a: "http://www.jplayer.org/audio/m4a/Miaow-07-Bubble.m4a",
        oga: "http://www.jplayer.org/audio/ogg/Miaow-07-Bubble.ogg"
    })
}

function makePaymentToAddress(address, amount, done) {
    resetQR();
    $('.playbar-shadow').removeClass('hide');
    $.ajax({
        url: "https://blockchain.info/api/receive?method=create&address=" + address
    })
        .done(function (data) {
            console.log(data.input_address);
            setQR(data.input_address);
            watchForpayment(data.input_address, amount, done);
        });

    return USDTouBTC(amount)
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
            var amountpaid = USDTouBTC(data)
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
            $('.playbar-shadow').addClass('hide')
            /*              if (filetype === 'mp3')
                            var url = 'http://ipfs.alexandria.media/ipfs/QmZVxewtGhtXG28fSBx7vUYCJiKdJWF2vW6rrEAuTUSP7b/Imogen%20Heap%20-%20Tiny%20Human.mp3';
                            else
                            var url = 'http://ipfs.alexandria.media/ipfs/QmZVxewtGhtXG28fSBx7vUYCJiKdJWF2vW6rrEAuTUSP7b/Imogen%20Heap%20-%20Tiny%20Human.flac';
                            document.getElementById('my_iframe').src = url;
            */
            done(amountpaid)
        });
}

function resetQR() {
    $('.pwyw-qrcode img').attr("src", 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==');

    $('.pwyw-btc-address').text('');
}

function setQR(address) {
    var url = "http://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + address;
    $('.pwyw-qrcode img').attr("src", url);

    $('.pwyw-btc-address').text(address);
}
