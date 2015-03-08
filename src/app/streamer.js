/* this can only work in node, we'd need an exclude for browser, or use browserify */

if (require === undefined)
    return;

var WebTorrent = require('webtorrent'),
    request = require('request'),
    rangeParser = require('range-parser'),
    _ = require('underscore'),
    mime = require('mime'),
    path = require('path'),
    express = require('express'),
    server = express()
;

var mediaAPIUrl = "http://54.172.28.195:41289/alexandria/v1/media"
var blacklist = {'btih:CW35T7WXXRC5RSS4IGDFIZ7CJN4MAUDC': true}
var p = path.join(process.env['HOME'], '.blocktech/')

var DLOpts = {
    tmp: path.join(p, '/DL/tmp'),
    storageOpts: {
        path: path.join(p, '/DL'),
    },
    verify: true
};

var Client = new WebTorrent(DLOpts);

function blacklistDeny(userId, doc) {
    console.log("checking", doc._id)
    if (blacklist[doc._id]) {
        console.error("not adding blacklisted torrent", doc._id)
        return false
    }
    return true
}

var seed = function (doc) {
    console.log ('adding', doc.magnet);

    Client.add(doc.magnet, DLOpts, function (torrent) {
        var biggestFile;
        torrent.files.forEach(function (file) {
            if (!biggestFile || file.length > biggestFile.length)
                biggestFile = file;
        });

        if (!biggestFile){
            console.error ("couldn't find a biggest file")
            return;
        }

        console.error ("update: biggest file is", biggestFile.name)
    });
}

function updateMediaAPI() {
    request({json: true, url: mediaAPIUrl + '/get/all'},
            function (err, data) {
                console.log("got API message")
                setTimeout(updateMediaAPI, 15*10e3)
                _.each(data.body, function (item) {
                    var it = item['media-data']['alexandria-media']
                    var dbItem = {
                        _id: it.torrent,
                        magnet: 'magnet:?xt=urn:' + it.torrent
                            + '&dn=' + encodeURIComponent(it.info.title)
                            + '&ws=' + encodeURIComponent('http://localhost:3000/download/')
                    }

                    console.log ("adding", dbItem)
                    if (blacklistDeny(null, dbItem))
                        seed(dbItem);
                })
            })
}
updateMediaAPI()


function errorOut(response, code, message) {
    response.statusCode = code;
    console.error (message)
    return response.end(message)
}

/* this is taken from popcorn's streamer-server, but it needs to be adapted
   to serve routes and not single files, so we keep it forked */

server.get('/stream/:id/:filename', function (request, response){
    console.log ('asked for', request.params.id, request.params.filename)
    var getType = mime.lookup.bind(mime);

    var torrent = Client.get(request.params.id)
    if (!torrent) {
        return errorOut (response, 500, 'Id not found')
    }

    var file = _.findWhere(torrent.files, {name: request.params.filename})
    if (!file) {
        return errorOut (response, 404, 'File not found: ' + torrent.files);
    }

    if (request.method === 'OPTIONS' && request.headers && request.headers['access-control-request-headers']) {
	response.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
			response.setHeader(
			    'Access-Control-Allow-Headers',
			    request.headers['access-control-request-headers']);
	response.setHeader('Access-Control-Max-Age', '1728000');

	response.end();
	return;
    }

    if (request.headers && request.headers.origin) {
        response.setHeader('Access-Control-Allow-Origin', request.headers.origin);
    }

    var range = request.headers?request.headers.range:undefined;
    range = range && rangeParser(file.length, range)[0];

    response.setHeader('Accept-Ranges', 'bytes');
    response.setHeader('Content-Type', getType(file.name));

    if (!range) {
        console.log("no range")
	response.setHeader('Content-Length', file.length);
	if (request.method === 'HEAD') return response.end();
	file.createReadStream().pipe(response)
	return;
    }

    console.log("range request", range)
    response.statusCode = 206;
    response.setHeader('Content-Length', range.end - range.start + 1);
    response.setHeader('Content-Range', 'bytes '+range.start+'-'+range.end+'/'+file.length);

    if (request.method === 'HEAD') {
        return response.end();
    }

    return file.createReadStream(range).pipe(response)
})

console.log ('streamer started on port', 3000)
server.listen(3000)
