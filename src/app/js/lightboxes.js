// LIGHTBOX
function lightbox(obj){
	var imgContent = $(obj).find('img').clone();
	$('#lightbox').children().remove();
	$('#lightbox').append(imgContent);
	$('#lightbox').show();
	var imgContentWidth = $(imgContent).width();
	var maxWH = .95; // Max width and height for lightboxed image
	if (imgContentWidth > window.innerWidth*maxWH) {
		$('#lightbox img').css('width',window.innerWidth*maxWH+'px');
		imgContentWidth = $('#lightbox img').width();
	}
	var imgContentHeight = $('#lightbox img').height();
	if (imgContentHeight > window.innerHeight*maxWH) {
		$('#lightbox img').css('width','auto');
		$('#lightbox img').css('height',window.innerHeight*maxWH+'px');
		imgContentHeight = $('#lightbox img').height();
		imgContentWidth = $('#lightbox img').width();
	}
	$('#lightbox img').css({
		'top': (window.innerHeight-imgContentHeight)/2+'px',
		'left': (window.innerWidth-imgContentWidth)/2+'px'
	});
}

// LIGHTBOX FOR VIDEO
function lightboxVideo(obj) {
	var videoURL = $(obj).attr('data-source');
	var videoContent = '<video controls="controls" poster="" autoplay><source src="'+videoURL+'" type="video/mp4" /><param name="autoplay" value="true" /></video>'
	$('#lightbox').children().remove();
	$('#lightbox').append(videoContent);
	$('#lightbox video').css({
		'top': '100%',
		'left': '100%'
	});
	$('#lightbox').show();
	var lightboxInterval = setInterval(function() {
		if ($('#lightbox video').width() > 200) {
			var videoContentWidth = $('#lightbox video').width();
			console.info(videoContentWidth);
			var maxWH = .95; // Max width and height for lightboxed image
			if (videoContentWidth > window.innerWidth*maxWH) {
				$('#lightbox video').css('width',window.innerWidth*maxWH+'px');
				videoContentWidth = $('#lightbox video').width();
			}
			var videoContentHeight = $('#lightbox video').height();
			console.info(videoContentHeight);
			if (videoContentHeight > window.innerHeight*maxWH) {
				$('#lightbox video').css('width','auto');
				$('#lightbox video').css('height',window.innerHeight*maxWH+'px');
				videoContentHeight = $('#lightbox video').height();
				videoContentWidth = $('#lightbox video').width();
			}
			$('#lightbox video').css({
				'top': (window.innerHeight-videoContentHeight)/2+'px',
				'left': (window.innerWidth-videoContentWidth)/2+'px'
			});
		}
	}, 500);
}
