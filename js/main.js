jQuery(document).ready(function($){
	replaceSVG();
	if (window.location.search.indexOf("view") == -1) {
		$('#search').fadeIn(fadeTimer);
		$('#addNewContent-icon').fadeIn(fadeTimer);
	}
	$('#spritz-container').hide();
	$('#adv-search').addClass('abs');
	$('#timeline-settings').addClass('abs');
	$('.info-modal').addClass('abs');
	$('#tip-modal').addClass('abs');
	$('.alex-ui-slider').slider();
	$('.alex-ui-datepicker').datepicker();
	// Footer timeline contruct
	if (window.location.search.indexOf("startDate") > -1) {
		$('.twitter-archive').not('main').show();
		displayItem('startDate');
	}
	// Timeline selected values change
	$("#timeline").bind("userValuesChanged", function(e, data){
		timeChange();
	});

	// UI/UX Navigation
	// Click logo to go back to archive list with current timeline selection
	$('#logo').click(function(){
		if($(this).hasClass('disabled')){
			return false;
		}
		if($('#tweetListView').css('display') == 'block') {
			clearModal();
		}
		resetAlexandria();
	});
	// Omnibox (search input)
	$('#search-main').on("keydown", function (e) {		
		playingTimeline = true;
		autoPlayTimeline();
		searchValue = $('#search-main').val();
		if($('#tweetListView').css('display') == 'block') {
			resetArchiveList = true;
		}
	});
	$('#search-main').on("keyup", function (e) {
		newSearchValue = $('#search-main').val();
		var code = e.keyCode || e.which;
		if (code == 32) {
			// pressin the space bar
		} else if ( (newSearchValue != searchValue) || (code == 16) ) {
			// nothing changed in search content
			if (searchTimerId) {
				clearTimeout ( searchTimerId );
			}
			// set a timer and run search if done typing
			searchTimerId = setTimeout ( 'runSearch("'+ newSearchValue +'")', 2000 );
		}
	});

	// Click icon in omnibox to clear and run search
	$('#search .clearSearch').click(function(){
		$(this).prev('input').val('');
		resetArchiveList = true
		runSearch('');
	});
	
	// Intro view icon interactions
	$('#enter-archives').click(function(){
		currentArchive = '*';
		searchTerm = '';
		currentView = 'archiveCloud';
		$('svg#volume').remove();
		$('.twitter-archive').not('main').show();
		buildTimeline();
		getJobs(searchTerm);
	});

	// Advanced Search toggle
	$('#adv-search-toggle').click(function(){
		$('#adv-search').fadeToggle(fadeTimer);
	});

	// Toggle modal on off-modal click
	// REWRITE WITHOUT jQUERY //
	$('body').on('click', function(e){
		if ( ($(e.target).attr('id') != 'adv-search') && (!$(e.target).parents('#adv-search')[0]) && ($(e.target).attr('id') != 'adv-search-toggle') ) {			
			if($('#adv-search').css('display') == 'block') {
				$('#adv-search').fadeToggle(fadeTimer);
			}
		}
		if ( ( (!$(e.target).hasClass('settings-icon')) && (!$(e.target).parents('#timeline-settings')[0]) ) || ($(e.target).hasClass('applybtn')) ) {
			if ( ($('#timeline-settings').css('display') == 'block') && ($('#timeline-settings').css('opacity')==1) ) {
				$('#timeline-settings').fadeToggle(fadeTimer);
			}
		}
		if ( (!$(e.target).hasClass('spritz-control')) && (!$(e.target).parents('#spritzer')[0]) ) {
			if ($('#spritz-container').css('display') == 'block') {
				$('#spritz-container').fadeOut(fadeTimer);
			}
		}
	});
	
	// Advanced Search clear button
	$('#adv-search .cancel-btn').click(function(){
		$('#adv-search').fadeToggle(fadeTimer).find('input[type="text"]').val('');
	});
	// View Controls
	$('.view-controls .view-link').click(function(){		
		var newView;
//		$('main').fadeOut(fadeTimer);
		switchView = $(this).text();
		if(switchView == 'Cloud') {
			newView = currentView.slice(0,-5)+'ListView';			
			currentView = newView;
			switchView = 'List';
			$('.sort-link').fadeIn(fadeTimer);
		} else {
			newView = currentView.slice(0,-8)+'Cloud';
			currentView = newView;
			switchView = 'Cloud';
			$('.sort-link').fadeOut(fadeTimer);
		}
		$('#'+newView).fadeIn(fadeTimer);
		$(this).text(switchView);
	});	
	// Sort - Archive List
	$('#resort-archView').click(function(){
//		$('main').not('#'+currentView).fadeOut(fadeTimer);
		$('#archiveList').toggleClass('pop-sort');
		$('#wordsList').toggleClass('pop-sort');
		if($('#archiveList').hasClass('pop-sort')){
			$('#archiveList li').sortElements(function(a, b){
				return parseInt($(a).attr('volume')) < parseInt($(b).attr('volume')) ? 1 : -1;
			});
			$(this).text('Popular');
		} else {
			sortUnorderedList("archiveList");
			$(this).text('Alphabetical');
		}
		if($('#wordsList').hasClass('pop-sort')){
			$('#wordsList li').sortElements(function(a, b){
				return parseInt($(a).attr('volume')) < parseInt($(b).attr('volume')) ? 1 : -1;
			});
			$(this).text('Popular');
		} else {
			sortUnorderedList("wordsList");
			$(this).text('Alphabetical');
		}
//		$('main #'+currentView).fadeIn(fadeTimer);
	});
	// Sort - Tweet List
	$('#resort').click(function(){
//		$('main').fadeOut(fadeTimer);
		$('#tweetListView').fadeIn(fadeTimer);
		$('#tweetList').toggleClass('pop-sort');
		if($('#tweetList').hasClass('pop-sort')){
			$('#tweetList li').sortElements(function(a, b){
				return parseInt($(a).attr('retweets')) < parseInt($(b).attr('retweets')) ? 1 : -1;
			});
			$(this).text('Popular');
		} else {
			$('#tweetList li').sortElements(function(a, b){
				return $(a).attr('tweetDate') < $(b).attr('tweetDate') ? 1 : -1;
			});
			$(this).text('Recent');
		}
	});
	// Button on start page
	$('.getAllArchives').click(function(){
		getAllArchives();
	});	
	
	// Modal controls
	$(document).on("keyup", function (e) {
		var code = e.keyCode || e.which;
		if (code == 27) {
			// esc pressed
			if($('#wait').css('display') == 'block') {
				$('#wait').hide();
				$('#disabler').hide();
			}
			if ( ($('#tweetListView').css('display') == 'block') && ($('#lightbox').css('display') != 'block') ) {
				clearModal();
			} else if ($('#lightbox').css('display') == 'block') {
				$('#lightbox').fadeOut(fadeTimer);
			}
		}
	});
	$('.close-modal').click(function(){
		clearModal();
	});	
	// Timeline controls
	$('#timeline-controls').click(function(){
//		$('svg#volume').remove();
	});
	$('#timeline-controls .full').click(function(){
		$("#timeline").dateRangeSlider("bounds", new Date(2014, 8, 8), new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate()+1));
		volumeBars(currentArchive,'',7200000);
	});
	$('#timeline-controls .month').click(function(){
		$("#timeline").dateRangeSlider("bounds", new Date(datetime.getFullYear(), datetime.getMonth()-1, datetime.getDate()), new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate()+1));
		volumeBars(currentArchive,'',7200000);
	});
	$('#timeline-controls .week').click(function(){
		$("#timeline").dateRangeSlider("bounds", new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate()-7), new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate()+1));
		volumeBars(currentArchive,'',7200000);
	});
	$('.playbtn').click(function(){
		autoPlayTimeline();
	});
	$('#footer .settings-icon').click(function(){
		$('#timeline-settings').fadeIn(fadeTimer);
	});
	$(window).scroll(function(){
		if($('#tweetListView').css('display') == 'block') {
			infiniteScroll();
		}
	});

	loadAlexandriaView();
	
	// Media Content Interface
	$('#addNewContent-icon').click(function(){
		loadShareMod();
	});

	// Get exchange rates
	getCryptos();
	
	// QR Code Lightbox
	$('#qrcode').click(function(){
		$('#lightbox').html('<div id="qrcode-lightbox"></div>');
		var qrcode = new QRCode("qrcode-lightbox", {
			text: "bitcoin:3CHHe6DwYFmx5c8LLm1RQBcGiexCJJrMqT?label=hoodiethehomeless",
			width: 400,
			height: 400,
			colorDark : "#000000",
			colorLight : "#FFFFFF",
			correctLevel : QRCode.CorrectLevel.H
		});
		$('#lightbox').fadeIn(fadeTimer);
	});
	
	// Add Media Tabs
	$('#add-media-menu li').click(function(){
		$(this).addClass('active').siblings().removeClass('active');
		$('#newMedia-tabs').find('.modal-tab#'+$(this).attr("name")).show().siblings().hide();
		var activeTabName = $('#add-media-menu li.active').attr('name');
		$('#add-media .pagination ul li').show();
		resizeTabs();
		var firstTab = $('#add-media-menu li:first-child').attr('name');
		var lastTab = $('#add-media-menu li:last-child').attr('name');
		if (activeTabName == lastTab) {
			$('#add-media .pagination ul li:last-child').removeClass('next').addClass('submit').text('Submit');
		} else {
			$('#add-media .pagination ul li:last-child').removeClass('submit').addClass('next').text('Next');
		}
		if (activeTabName == firstTab) {
			$('#add-media .pagination ul li.prev').hide();
		}
	});
	
	// Select Media Type
	$('select#mediaType').change(function(){
		var mediaType = $(this).val();
		$('#newMedia-info fieldset').hide();
		if (mediaType != '') {
			$('fieldset#new-'+mediaType+'-meta').show();
			$('.row.choosefile').show();
		} else {
			$('.row.choosefile').hide();
		}
		resizeTabs();
	});
	
	// File uploader init
	$('.uploader').each(function(){
		uploadFile($(this));
		$(this).click(function(){
			uploadFile($(this));
		});
	});

	$('#add-media .pagination li').click(function(){
		var activeTab = $('#add-media-menu li.active');
		if ($(this).hasClass('next')) {
			$(activeTab).next('#add-media-menu li').click();
		} else if ($(this).hasClass('prev')) {
			$(activeTab).prev('#add-media-menu li').click();
		} else if ($(this).hasClass('submit')) {
			alert("Just like that! You're a rockstar! See how easy that was?");
		}
	});

	// Recent Media interaction
	$('.row.media-entity .load-entity').click(function(){
		var thisMediaType = $(this).parents('.media-entity').attr('media-type');		
		var thisMediaTitle = $(this).parents('.media-entity').find('.media-title').text();
		var thisMediaMeta = $(this).parents('.media-entity').find('.media-meta').text();
		console.log(thisMediaType);
		console.log(thisMediaTitle);
		console.log(thisMediaMeta);
		loadMediaView(thisMediaType, thisMediaTitle, thisMediaMeta);
		$('#viewlabel').fadeIn(fadeTimer);
	});
	
	// Alexandria Theme UI interactions
	$('.alex-switch').click(function(){
		$(this).toggleClass('switched-on');
	});
	
	// Media Entity view interactions
	$('.lightboxVideo').click(function(){
		var videoSRC = $(this).attr('data-source');
		var videoEmbed = '<video controls> <source src="'+ videoSRC +'" type="video/mp4" /> </video>';
		$('#lightbox').children().remove();
		$('#lightbox').show();
		$('#lightbox').append(videoEmbed);
		$('#lightbox video').css('width','80%');
		var vidContentWidth = $('#lightbox video').width();
		var vidContentHeight = $('#lightbox video').height();
		$('#lightbox video').css({
			'top': (window.innerHeight-vidContentHeight)/2+'px',
			'left': (window.innerWidth-vidContentWidth)/2+'px'
		});		
	});

	// Tip Modal Tabs
	$('.modal-tabs li').click(function(){
		$(this).addClass('active').siblings().removeClass('active');
		$('#tip-modal').find('.modal-tab#'+$(this).attr("name")).show().siblings('.modal-tab').hide();
	});

	// Tip Modal Amount
	$('input[name="tip-amount"]').click(function(){
		if ($(this).attr('id')=='tip-option-custom') {
			var tipAmount = parseFloat($(this).siblings('.tip-input').val());
		} else {
			var tipAmount = parseFloat($(this).val());
		}
		$('.tip-value').text(tipAmount);
		$('.flo-usd .flo-usd-output').text(Math.round((tipAmount/FLOUSD)*100)/100);
		$('.btc-usd .btc-usd-output').text(Math.round((tipAmount/BTCUSD)*100000000)/100000000);
	});	
	$('input[name="tip-amount"]').filter('[value="1.00"]').click();
	$('.tip-input').focus(function(){
		$(this).siblings('input[type="radio"]').click();
	});
	$('.tip-input').keyup(function(){
		var tipAmount = parseFloat($(this).val());
		$('.tip-value').text(tipAmount);
		$('.flo-usd .flo-usd-output').text(Math.round((tipAmount/FLOUSD)*100)/100);
	}); 
	// API Server ID and Control
	if(serverAddress == '54.172.28.195'){
		$('#serverID').text('Dev');
	} else {
		$('#serverID').text('Demo');
	}
	$('#serverID').click(function(){
		if(serverAddress == '54.172.28.195'){
			serverAddress = 'blue.a.blocktech.com'
			$('#serverID').text('Demo');
		} else {
			serverAddress = '54.172.28.195'
			$('#serverID').text('Dev');
		}		
	});
	
}); // End Document.Ready

// DEFAULT VARIABLES

// var serverAddress = '54.172.28.195'; // Dev
var serverAddress = 'blue.a.blocktech.com'; // Demo

var w = window.innerWidth;				
var h = window.innerHeight-245;

var datetime = new Date();
var days = ["0", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];	

var fadeTimer = 200;

var activeJobsCache = [];
var MaxResults;
var newArchiveVolumeQueryStringCache = [];
var newArchiveVolumeCache = [];
var defaultMaxResults = 50;
var cloudlist = [],
    max,
    scale = 1,
    complete = 0,
    keyword = "",
    tags,
    fontSize,
    maxLength = 30,
    fetcher;
var fontSizeMultiplier;
var layout = d3.layout.cloud()
	.timeInterval(10)
	.size([window.innerWidth, window.innerHeight-245])
	.rotate(0)
	.font("Avenir-Book")
	.fontSize(function(d) { return d.size; })
	.text(function(d) { return d.text; })
	.on("end", draw);
	
var svg = d3.select("#vis").append("svg")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight-245);

var background = svg.append("g"),
    vis = svg.append("g")
    .attr("transform", "translate(" + [window.innerWidth >> 1, window.innerHeight-245 >> 1] + ")");

var currentView = 'archiveCloud';
var currentArchive = '*';
var currentArchiveLowercase = '*';
var activeWord;
var searchResults = [];
var searchResultsCache = [];
var resetArchiveList = false;
var currentPage = 0;
var totalPages = 0;
var cloudCache = [];

var playingTimeline = false;
var animDuration = 3500;

var expandList = true;

var startDateValue = Date.parse(datetime)-86400000;
var endDateValue = Date.parse(datetime);

var prevStartDate = '';
var prevEndDate = '';

var freshLoad = true;

// Get crypto [cryptsy] exchange rates
var FLOCost;
var FLOLTC;
var LTCUSD;
var FLOUSD;
var BTCUSD;
function getCryptos() {
// Bitcoin
	$.ajax({
	    url: 'http://pubapi.cryptsy.com/api.php?method=singlemarketdata&marketid=2',
	    type: 'GET',
	    success: function(e) {
			var el = $( '#sketchpad' );
			el.html(e.responseText);
			var data = $.parseJSON($('p', el).html());
			BTCUSD = parseFloat(data.return.markets.BTC.lasttradeprice);
			$('.btc-usd .btc-usd-output').text(Math.round((1/BTCUSD)*100000000)/100000000);
			var qrcode = new QRCode("qrcode", {
				text: "bitcoin:3CHHe6DwYFmx5c8LLm1RQBcGiexCJJrMqT?label=hoodiethehomeless",
				width: 64,
				height: 64,
				colorDark : "#000000",
				colorLight : "#d8d8d8",
				correctLevel : QRCode.CorrectLevel.H
			});

		}
	});
	$.ajax({
	    url: 'http://pubapi.cryptsy.com/api.php?method=singlemarketdata&marketid=61',
	    type: 'GET',
	    success: function(e) {
			var el = $( '#sketchpad' );
			el.html(e.responseText);
			var data = $.parseJSON($('p', el).html());
			$('#flo-ltc label').text(data.return.markets.FLO.label).next('span').text(data.return.markets.FLO.lasttradeprice);
			FLOLTC = parseFloat($('#flo-ltc span').text());
			$.ajax({
				url: 'http://pubapi.cryptsy.com/api.php?method=singlemarketdata&marketid=1',
				type: 'GET',
				success: function(e) {
					var el = $( '#sketchpad' );
					el.html(e.responseText);
					var data = $.parseJSON($('p', el).html());
					$('#ltc-usd label').text(data.return.markets.LTC.label).next('span').text(data.return.markets.LTC.lasttradeprice);
					LTCUSD = parseFloat($('#ltc-usd span').text());
					FLOUSD = FLOLTC*LTCUSD;
					$('#flo-usd label').text('FLO/USD').next('span').text(FLOUSD);
					FLOCost = parseFloat($('#flo-cost').text());
					$('.flo-usd .flo-usd-output').text(Math.round((1/FLOUSD)*100)/100);
					$('#newMedia-notary .flo-usd-output').text(Math.round((FLOUSD*FLOCost)*100000)/100000);
				}
			});
		}
	});
}

// BUILD TIMELINE
function buildTimeline() {
	console.log('startDate = '+startDateValue+', endDate = '+endDateValue)
	$("#timeline").dateRangeSlider({
		bounds: {min: new Date(datetime.getFullYear(), datetime.getMonth()-1, datetime.getDate()), max: new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate()+1)},
		defaultValues: {min: startDateValue, max: endDateValue},
		arrows: false,
		scales: [{
		  first: function(value){ return value; },
		  end: function(value) {return value; },
		  next: function(value){
			var next = new Date(value);
			return new Date(next.setDate(value.getDate() + 1));
		  },
		  label: function(value){
			return days[value.getDate()];
		  },
		  format: function(tickContainer, tickStart, tickEnd){
			tickContainer.addClass("myCustomClass");
		  }
		}]
	});
	// Timeline breadcrumbs
	if ($('.currentStartTime').text()=='') {
		$('.currentStartTime').text($("#timeline").dateRangeSlider("values").min);
		$('.currentEndTime').text($("#timeline").dateRangeSlider("values").max);
	}
	$('#viewlabel').fadeIn(fadeTimer);
}


// TIMELINE CHANGE
function timeChange() {
	resetArchiveList = true;
	startDateValue = Date.parse($("#timeline").dateRangeSlider("values").min);
	endDateValue = Date.parse($("#timeline").dateRangeSlider("values").max);
	$('.currentStartTime').text(new Date(parseInt(startDateValue)));
	$('.currentEndTime').text(new Date(parseInt(endDateValue)));
	if($('#tweetListView').css('display') == 'block') {
		currentPage = 0;
		totalPages = 0;
		$('ul#tweetList li').remove();
		if(!activeWord){
			var searchWord = currentArchive;			
		} else {
			var searchWord = activeWord;			
		}
		var stateObj = {
			startDateValue: startDateValue,
			endDateValue: endDateValue,
			archive: currentArchive,
			word: searchWord
		};
		var newURL = document.location.origin + document.location.pathname + '?startDate='+startDateValue+'&endDate='+endDateValue+'&archive='+encodeURIComponent(currentArchive) + '&word='+encodeURIComponent(activeWord);
		history.pushState(stateObj, 'Alexandria > '+currentArchive+' > ' + activeWord, newURL);
		document.title = 'Alexandria > '+currentArchive+' > ' + activeWord;
		wordSearch(currentArchive, searchWord, 40, 0);
		resetArchiveList = true;
	} else {			
		if (currentView.slice(0,5) == 'words') {
			var stateObj = {
				startDateValue: startDateValue,
				endDateValue: endDateValue,
				archive: currentArchive,
				word: ''
			};
			if(window.location.search==''){
				var newURL = document.location.origin + document.location.pathname +'?archive='+encodeURIComponent(currentArchive);
			} else {
				var newURL = document.location.origin + document.location.pathname + '?startDate='+startDateValue+'&endDate='+endDateValue + '&archive='+encodeURIComponent(currentArchive);
			}
			history.pushState(stateObj, 'Alexandria > '+currentArchive, newURL);
			document.title = 'Alexandria > '+currentArchive;
			getArchiveWords(searchTerm);
		} else {
			if(!searchTerm) {
				var searchTerm = '';
			}
			console.log(searchTerm);
			getJobs(searchTerm);
		}
	}
}

// Draw Word Clouds
function draw(words, bounds) {
  scale = bounds ? Math.min(
      w / Math.abs(bounds[1].x - w / 2),
      w / Math.abs(bounds[0].x - w / 2),
      h / Math.abs(bounds[1].y - h / 2),
      h / Math.abs(bounds[0].y - h / 2)) / 2 : 1;
	var thisCloudView = currentView;
	if ((currentView == 'archiveListView') || (currentView == 'wordsListView') ) {
		thisCloudView = currentView.slice(0,-8)+'Cloud';
	}
  var text = vis.selectAll("text")
		.data(words, function(d) { return d.text.toLowerCase(); });
  text.transition()
		.duration(animDuration)
		.attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
		.style("font-size", function(d) { return d.size + "px"; });
	text.enter().append("text")
		.attr("text-anchor", "middle")
		.attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
		.style("font-size", function(d) { return d.size + "px"; })
		.style("opacity", 1e-6)
		.on("click", function(d) {
			if (playingTimeline == true) {
				autoPlayTimeline();
			}
			$('#wait').fadeIn(fadeTimer);
			$('#disabler').fadeIn(fadeTimer);
			var item = d.text;
			if(currentView == 'wordsCloud' ){				
				$('main.wordCloud text').css({
					'transition': 'all 3s ease',
					'-moz-transition': 'all 3s ease',
					'-webkit-transition': 'all 3s ease',
					'-o-transition': 'all 3s ease'
				});
				$('#tweetList li').remove();
//				$('svg#volume').remove();
				activeWord = item;
				startDateValue = Date.parse($("#timeline").dateRangeSlider("values").min);
				endDateValue = Date.parse($("#timeline").dateRangeSlider("values").max);
				$('.currentStartTime').text(new Date(parseInt(startDateValue)));
				$('.currentEndTime').text(new Date(parseInt(endDateValue)));
				var stateObj = {
					startDateValue: startDateValue,
					endDateValue: endDateValue,
					archive: currentArchive,
					word: activeWord
				};
				var newURL = document.location.origin + document.location.pathname + '?startDate='+startDateValue+'&endDate='+endDateValue+'&archive='+encodeURIComponent(currentArchive) + '&word='+encodeURIComponent(activeWord);
				history.pushState(stateObj, 'Alexandria > '+currentArchive+' > ' + activeWord, newURL);
				document.title = 'Alexandria > '+currentArchive+' > ' + activeWord;
				// VOLUME BARS FOR TWEETLIST
				wordSearch(currentArchive, activeWord, 40, 0);
				volumeBars(currentArchive, activeWord, 7200000);
			} else {
				currentArchive = item;
				$('.archiveLabel').fadeIn(fadeTimer);
				$('#viewlabel .currentArchive').text(currentArchive);
				searchTerm = currentArchive;
				currentView = 'wordsCloud';
				startDateValue = Date.parse($("#timeline").dateRangeSlider("values").min);
				endDateValue = Date.parse($("#timeline").dateRangeSlider("values").max);
				var stateObj = {
					startDateValue: startDateValue,
					endDateValue: endDateValue,
					archive: currentArchive,
					word: ''
				};
				if(window.location.search==''){
					var newURL = document.location.origin + document.location.pathname +'?archive='+encodeURIComponent(currentArchive);
				} else {
					var newURL = document.location.origin + document.location.pathname + '?startDate='+startDateValue+'&endDate='+endDateValue + '&archive='+encodeURIComponent(currentArchive);
				}
				history.pushState(stateObj, 'Alexandria > '+currentArchive, newURL);
				document.title = 'Alexandria > '+currentArchive;
				getArchiveWords(item);
				volumeBars(currentArchive,'',7200000);
			}
      })
    .transition()
      .duration(animDuration)
      .style("opacity", 1);
  text.style("font-family", function(d) { return d.font; })
		.style("fill", function (d) { // base fill on ratio of number of actual results
			if ( (d.text == currentArchiveLowercase) && ( currentArchiveLowercase != '*' ) ) {
				return '#9DA2CF';
			}
			else if (d.fill < .075) { return '#cccccc' }
			else if (d.fill < .15) { return '#bbbbbb' }
			else if (d.fill < .225) { return '#aaaaaa' }
			else if (d.fill < .3) { return '#999999' }
			else if (d.fill < .375) { return '#888888' }
			else if (d.fill < .45) { return '#777777' }
			else if (d.fill < .525) { return '#666666' }
			else if (d.fill < .6) { return '#555555' }
			else if (d.fill < .675) { return '#444444' }
			else if (d.fill < .75) { return '#333333' }
			else if (d.fill < .825) { return '#222222' }
			else if (d.fill < .9) { return '#111111' }
			else { return '#111111' };
		})
      .text(function(d) { return d.text; });
  var exitGroup = background.append("g")
      .attr("transform", vis.attr("transform"));
  var exitGroupNode = exitGroup.node();
  text.exit().each(function() {
    exitGroupNode.appendChild(this);
  });
  exitGroup.transition()
      .duration(1000)
      .style("opacity", 1e-6)
      .remove();
  vis.transition()
      .delay(1000)
      .duration(750)
      .attr("transform", "translate(" + [window.innerWidth >> 1, window.innerHeight-200 >> 1] + ")");
	setTimeout ( 'resetInterface()', animDuration );
	$('#vis').fadeIn(fadeTimer);
}

function getAllArchives(){
	searchValue = '';
	$('#search-main').val(searchValue);
	var basicSliderBounds = $("#timeline").dateRangeSlider("bounds");
	var startDate = Date.parse(basicSliderBounds.min);
	var endDate = Date.parse(datetime);
	$("#timeline").dateRangeSlider("values", startDate, endDate);
}

// RUN SEARCH
var searchValue = '';
var newSearchValue = '';
var searchTimerId = 0;
var searchRunning;
var searchTerm;

function runSearch(searchTerm) {	
	clearTimeout ( searchTimerId );
	searchRunning = 0;
	$('.twitter-archive').not('main').show();
	if($('#tweetListView').css('display') == 'block') {
		clearModal();
	}	
	if (currentView.slice(0,5) == 'words') {
		getArchiveWords(currentArchive, searchTerm);
	} else {
		getJobs(searchTerm);
	}	
//	$('svg#volume').remove();
	volumeBars(currentArchive,'',7200000);
}

// NEW GET ACTIVE JOBS AND VOLUMES
function getJobs(searchTerm) {
	if ($('#timeline').children().length == 0) {
		buildTimeline();
	}
	console.log('Searching for '+searchTerm);
	if(window.location.search != '') {
		if (window.location.search.indexOf("startDate") > -1) {
			$("#timeline").dateRangeSlider("values", startDateValue, endDateValue);
		}
	} else {		
		startDateValue = Date.parse($("#timeline").dateRangeSlider("values").min);
		endDateValue = Date.parse($("#timeline").dateRangeSlider("values").max);
	}
	var stateObj = {
		startDateValue: startDateValue,
		endDateValue: endDateValue,
		archive: '*',
		word: ''
	};
	console.log('currentArchive = '+ currentArchive);	
	if(currentArchive == '*'){
		var newURL = document.location.origin + document.location.pathname +'?startDate='+startDateValue+'&endDate='+endDateValue;
	}/* else {
		var newURL = document.location.origin + document.location.pathname +'?startDate='+startDateValue+'&endDate='+endDateValue+'&archive='+encodeURIComponent(currentArchive);
	} */
	history.pushState(stateObj, 'Alexandria > Twitter Archives', newURL);
	document.title = 'Alexandria > Twitter Archives';
	if(resetArchiveList == true){
		resetArchiveList = false;
		newArchiveVolumeCache.length = 0;
		newArchiveVolumeQueryStringCache.length = 0;
	}
	searchResults.length = 0;
	searchResultsCache.length = 0;
	if (!searchTerm) {
		var searchTerm = '';
	}
	$('#wait').fadeIn(fadeTimer);
	$('#disabler').fadeIn(fadeTimer);
	$('.search').attr('disabled','disabled');
	$('#intro').fadeOut(fadeTimer);
	$('main').not('#'+currentView).not('#vis').fadeOut(fadeTimer);
	if ((currentView == 'archiveListView') || (currentView == 'wordListView') ) {
		$('#'+currentView+' li').remove();
	} else {
		$('#'+currentView.slice(0,-5)+'ListView li').remove();
	}
	var queryString = '{"StartDate": '+startDateValue+',"EndDate": '+endDateValue+'}';
	// Check the cache for recent query
	var cacheCheck = false;
	if(jQuery.inArray(queryString, newArchiveVolumeQueryStringCache) > -1){
		console.log('queryString = '+queryString);
		console.log('newArchiveVolumeQueryStringCache = '+newArchiveVolumeQueryStringCache);
		console.log('newArchiveVolumeCache = '+newArchiveVolumeCache);
		cacheCheck = true;
		newArchiveVolumeCache.forEach(function(a, i){
			if(!searchTerm){
				$("#archiveList").append('<li id="archive-'+a[0].replace(/ /g,"-")+'" volume="'+a[1]+'"><a href="#" onclick="wordSearch(\x27'+a[0]+'\x27, \x27'+a[0]+'\x27, 40, 0)"><span>' + a[0] + '</span> <span class="archive-volume">'+a[1]+'</span></a></li>');
				searchResults.push(a[0]);
			} else {
				var titleSlice = a[0].slice(0,searchTerm.length);
				if(titleSlice.toLowerCase() == searchTerm.toLowerCase()) {
					$("#archiveList").append('<li id="archive-'+a[0].replace(/ /g,"-")+'" volume="'+a[1]+'"><a href="#" onclick="wordSearch(\x27'+a[0]+'\x27, \x27'+a[0]+'\x27, 40, 0)"><span>' + a[0] + '</span> <span class="archive-volume">'+a[1]+'</span></a></li>');
					searchResults.push(a[0]);
				}
			}
		});
	}
	if(cacheCheck == false){		
		console.log('API call: get/activejobs/betweenDates ... '+searchTerm);
		console.info('queryString =='+queryString);
		newArchiveVolumeQueryStringCache.length = 0;
		newArchiveVolumeCache.length = 0;
		$.ajax({
			type: "POST",
			data: queryString.toString(),
			url: "http://"+ serverAddress +":3000/alexandria/v1/twitter/get/activejobs/betweenDates",
			success: function (e) {
				console.log('getJobs() Ajax: get/activejobs/betweenDates ... '+searchTerm);
				var data = $.parseJSON(e);
				// Cache the query string
				newArchiveVolumeQueryStringCache.push(queryString);
				for (var i = 0; i < data['Jobs'].length; i++) {
					if ( data['Count'][i] != 0 ) {
						if(!searchTerm){
							console.log(data['Jobs'][i]+','+data['Count'][i]);
							newArchiveVolumeCache.push([data['Jobs'][i],data['Count'][i]]);
							$("#archiveList").append('<li id="archive-'+data['Jobs'][i].replace(/ /g,"-")+'" volume="'+data['Count'][i]+'"><a href="#" onclick="wordSearch(\x27'+data['Jobs'][i]+'\x27, \x27'+data['Jobs'][i]+'\x27, 40, 0)"><span>' + data['Jobs'][i] + '</span> <span class="archive-volume">'+data['Count'][i]+'</span></a></li>');
						} else {
							var titleSlice = data['Jobs'][i].slice(0,searchTerm.length);
							if(titleSlice.toLowerCase() == searchTerm.toLowerCase()) {
								// Cache the results
								newArchiveVolumeCache.push([data['Jobs'][i],data['Count'][i]]);
								$("#archiveList").append('<li id="archive-'+data['Jobs'][i].replace(/ /g,"-")+'" volume="'+data['Count'][i]+'"><a href="#" onclick="wordSearch(\x27'+data['Jobs'][i]+'\x27, \x27'+data['Jobs'][i]+'\x27, 40, 0)"><span>' + data['Jobs'][i] + '</span> <span class="archive-volume">'+data['Count'][i]+'</span></a></li>');
							}
						}
					}
				}
				buildArchiveList();
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				console.log(XMLHttpRequest);
				console.log(textStatus);
				console.log(errorThrown);
				librarianErr();
			}
		});
	} else {
		cacheCheck = false;
		console.log('searchResults.length = '+searchResults.length);
		if(searchResults.length > 0){
			if(searchResults.length == $('#archiveList li').length){
				newArchiveVolumeCache.forEach(function(a, i){
					if(jQuery.inArray(a[0], searchResults) > -1){
						searchResultsCache.push(a);
					}
				});
				buildArchiveList();
			}
		} else {
			console.error('Problem in getJobs cacheCheck function');
		}
	}
}

// Build archiveList and cloudlist array and call word cloud function
function buildArchiveList() {
//	$('svg#volume').remove();
	console.log(newArchiveVolumeCache);
	$('#archiveList li').each(function(){
		var volumeSpan = $(this).find('span.archive-volume').html();
		if((volumeSpan=='')||(volumeSpan==0)){
			$(this).remove();
		}
	});
	$('#archiveListView').css('height',$('#archiveList').height()+100+'px');
	// Populate cloudlist array with raw data			
	var cloudlistraw = [];
	var cloudlist = [];
	if ((searchResultsCache.length==0)&&(newArchiveVolumeCache.length!=0)) {
		$.each(newArchiveVolumeCache,function(i, d){
			cloudlistraw.push([i,d]);
		});				
	} else if (searchResultsCache.length!=0) {
		$.each(searchResultsCache,function(i, d){
			cloudlistraw.push([i,d]);
		});
	} else {
		console.error('No Archives Found');
	}
	cloudlistraw.sort(function(a,b){ return a[1][1]>b[1][1]?1:-1; });
	cloudlistraw.forEach(function(a){
		if(a[1][1]>0){
			cloudlist.push(a[1]);
		}
	});
	console.log('cloudlistraw = '+cloudlistraw);
	console.log('cloudlist = '+cloudlist);
	// Sort list according to client session preference
	if($('#resort-archView').text() == 'Popular') {
		$('#archiveList').addClass('pop-sort');
		$('#archiveList li').sortElements(function(a, b){
			return parseInt($(a).attr('volume')) < parseInt($(b).attr('volume')) ? 1 : -1;
		});
	} else {
		sortUnorderedList("archiveList");
	}
	$('.view-link').fadeIn(fadeTimer);

	// Build Word Cloud
	console.info(cloudlist);
	buildWordCloud(cloudlist, defaultMaxResults);
}

// Get top words in archive and construct cloud
function getArchiveWords(arch, filterword) {
	if(!arch){
		if (currentArchive) {
			var arch = currentArchive;
		} else {
			console.log('No archive title!');
			return false;
		}
	}
	// Loading spinner
	$('#wait').fadeIn(fadeTimer);
	$('#disabler').fadeIn(fadeTimer);
//	$('svg#volume').remove();
	$('main article ul li').remove();
	// Adjust interface display for Words cloud display
	$('.sort-link').fadeOut(fadeTimer);
	// Construct query string
	var queryStringMod = '';
	if (filterword) { queryStringMod = ',"FilterWord":"'+filterword+'"'; }
	var queryString = '{"Archive": "'+ arch +'","StartDate": '+startDateValue+',"EndDate": '+endDateValue+',"MaxResults": '+defaultMaxResults+',"FilterStopWords": true'+queryStringMod+'}';
	console.log('API call: get/archive/betweenDates/wordcloud ...');
	console.log('currentView = '+currentView);
	$.ajax({
		type: "POST",
		url: "http://"+ serverAddress +":3000/alexandria/v1/twitter/get/archive/betweenDates/wordcloud",
		data: queryString.toString(),
		success: function (e) {
			console.log('getArchiveWords() Ajax: betweenDates/wordcloud ... '+queryString);
			var data = $.parseJSON(e);
			// Load words
			var cloudlistraw = [],i;
			cloudlist = [];
			// Add words and volumes to array and hidden list
			$.each(data,function(word, weight){
				cloudlistraw.push([word,weight]);
				$("#wordsList").append('<li class="responseRow" volume="'+weight+'"><a href="#" onclick="wordSearch(&quot;'+searchTerm+'&quot;, &quot;'+ word +'&quot;, 40, 0);"><span>' + word + '</span> <span class="archive-volume">'+ weight +'</span></a></li>');
			});
			// Sort the words array and list by volume
			cloudlistraw.sort(function(a,b){ return a[1]>b[1]?1:-1; });
			cloudlistraw.forEach(function(a){
				cloudlist.push(a[0]);
			});
			$('#wordsList li').sortElements(function(a, b){
				return parseInt($(a).attr('volume')) < parseInt($(b).attr('volume')) ? 1 : -1;
			});
			$('#wordsList').addClass('pop-sort');
			// Build the interface
			$('.sort-link').text('Popular');
			$('#wordsListView').css('height',$('#wordsList').height()+100+'px');
			buildWordCloud(cloudlistraw, defaultMaxResults);
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			console.log(XMLHttpRequest);
			console.log(textStatus);
			console.log(errorThrown);
			librarianErr();
		}
	});
}

// Build WORD CLOUD
function buildWordCloud(cloudlist, MaxResults) {
	if (currentView == 'wordsCloud') {
		if (cloudCache.length > 0) {
			console.log('Word cloud cache exists!');
			console.info(cloudCache);
		}
	}
	// Determine word cloud density for word size and fill
	if (!MaxResults) {
		MaxResults = defaultMaxResults;
	}
	if (cloudlist.length < MaxResults)  {
		totalResults = cloudlist.length;
	} else {
		totalResults = MaxResults;
	}
	fontSizeMultiplier = ((MaxResults-totalResults)/MaxResults)+(document.emSize()[1]*.25); // Difference between largest and smallest word based on browser font size AND number of results
	currentArchiveLowercase = currentArchive.toLowerCase();
	var maxWeight = cloudlist[cloudlist.length-1][1];
	var minWeight = cloudlist[0][1];
	layout.stop().words(cloudlist.map(function(d, i) {
		console.info(d);
		console.log('d[1]/maxWeight = '+d[1]/maxWeight);
		var wordWeight = d[1]/maxWeight;
		return {text: d[0], size: ((wordWeight*fontSizeMultiplier)+1)*document.emSize()[1], fill: wordWeight }; // base size on ratio of number of actual results
	})).padding(5*fontSizeMultiplier).start();
	if($('#tweetListView').css('display') != 'block') {
		$('main').not('#'+currentView).not('#vis').fadeOut(fadeTimer);		
	}
	$('main #'+currentView).fadeIn(fadeTimer);
	volumeBars(currentArchive, '', 7200000);
}

// Build TWEET LIST
function wordSearch(arch, word, rpp, currentPage) {
	$("#tweetList li.more-link").remove();
	$('#wait').fadeIn(fadeTimer);
	if($('#tweetListView').css('display') != 'block') {
		$('#disabler').fadeIn(fadeTimer);
	}
	resetArchiveList = false;
	var pageFix = currentPage+1;
	if(!arch){
		arch = currentArchive;
	}
	if((!arch)||(!word)||(!rpp)||(!pageFix)){
		console.log(arch + ', ' + word + ', ' + rpp + ', ' + pageFix);
		if(!arch){console.log('arch!')}else if(!word){console.log('word!')}else if(!rpp){console.log('rpp = '+rpp)}else if(!pageFix){console.log('pageFix = '+pageFix)}else{console.log('something else!')}
		console.error('error in wordSearch');		
		return false;
	} else {
		activeWord = word;
		if($('#tweetListView').css('display') != 'block') {
			searchValue = $('#search-main').val();
			$('.view-controls').fadeOut(fadeTimer);
		}
//		var dateValues = $("#timeline").dateRangeSlider("values");
		if ( totalPages == 0 ) {
			// GET TOTAL PAGES
			totalPagesAPI(arch, word, startDateValue, endDateValue, rpp);
		}
		// Get a page of tweets between two dates
		tweetListPageAPI(arch, word, startDateValue, endDateValue, rpp);
	}
}

function totalPagesAPI(arch, word, StartDate, EndDate, rpp){
	if(arch == '*'){
		console.error('FAIL: arch = *, currentArchive = '+currentArchive+', word = '+word);
		return false;
	}
	if(currentArchive == '*'){
		currentArchive = arch;
		seachTerm = arch;
	}
	if((word == '*')||(!word)){
		var word = arch;
	}
	if(!rpp){
		var rpp = 40;
	}
	if((!arch)||(!word)||(!StartDate)||(!EndDate)||(!rpp)){
		console.log(arch + ', ' + word + ', ' + StartDate + ', ' + EndDate + ', ' + rpp);
		console.error('error in totalPagesAPI');		
		return false;
	} else {
		// GET TOTAL PAGES
		var queryString = '{"Archive":"'+arch+'","Word":"'+word+'","StartDate":'+StartDate+',"EndDate":'+EndDate+',"ResultsPerPage": '+rpp+'}';
		console.log('API call: betweenDates/wordsearch/pagecount');
		$.ajax({
			type: "POST",
			url: "http://"+ serverAddress +":3000/alexandria/v1/twitter/get/tweets/betweenDates/wordsearch/pagecount",
			data: queryString.toString(),
			success: function (e) {
				console.log('wordSearch() Ajax: betweenDates/wordsearch/pagecount ... '+queryString);
				totalPages = $.parseJSON(e);
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					console.error("some error");
					console.log(XMLHttpRequest);
					console.log(textStatus);
					console.log(errorThrown);
					librarianErr();
			   }
		});
	}
}

function tweetListPageAPI(arch, word, StartDate, EndDate, rpp) {
	if(arch == '*'){
		console.error('FAIL: arch = *, currentArchive = '+currentArchive+', word = '+word);
		return false;
	}
	if(currentArchive == '*'){
		currentArchive = arch;
		seachTerm = arch;
	}
	if((word == '*')||(!word)){
		var word = arch;
	}
	if(!rpp){
		var rpp = 40;
	}
	if((!arch)||(!word)||(!StartDate)||(!EndDate)||(!rpp)){
		console.log(arch + ', ' + word + ', ' + StartDate + ', ' + EndDate + ', ' + rpp);
		console.error('error in tweetListPageAPI');		
		return false;
	} else {
		// Get a page of tweets between two dates
		var queryString = '{"Archive": "'+arch+'","Word": "'+word+'","StartDate": '+StartDate+',"EndDate": '+EndDate+',"ResultsPerPage": '+rpp+',"Page": '+ currentPage +'}';
		console.log('API call: get/tweets/betweenDates/wordsearch ...');
		if($('#tweetListView').css('display') != 'block') {
			searchValue = $('#search-main').val();
			$('.view-controls').fadeOut(fadeTimer);
			$('.overlay').fadeIn(fadeTimer);
			$('#timeline-controls').fadeOut(fadeTimer);				
			$('main.wordCloud text').css({
				'text-shadow':'0 0 .2em rgba(100,100,100,.75)',
				'opacity':'.75',
				'-ms-filter': 'progid:DXImageTransform.Microsoft.Alpha(Opacity=75)',
				'filter':'alpha(opacity=75)',
				'-moz-opacity': '0.75',
				'-khtml-opacity': '0.75'					
			});
		}
		$.ajax({
			type: "POST",
			url: "http://"+ serverAddress +":3000/alexandria/v1/twitter/get/tweets/betweenDates/wordsearch",
			data: queryString.toString(),
			success: function (e) {
				console.log('wordSearch() Ajax: betweenDates/wordsearch ... '+queryString);
				var data = $.parseJSON(e);
				// Load a page of tweets
				for (var i = 0; i < data.length; i++) {
					var expanded_url = [];
					var render_url = '';
					var TweetEntities = [];
					var media_url = [];
					if(data[i].p.twitter.data.entity){
						var TweetEntities = data[i].p.twitter.data.entity;
						console.info(TweetEntities);
						var TweetEntitiesMedia = TweetEntities.media;
						if (TweetEntitiesMedia) {
							for(var iurl = 0; iurl < TweetEntitiesMedia.length; iurl++){
								var iurl_expanded = data[i].p.twitter.data.entity.media[iurl];
								if(iurl_expanded['type'] != 'photo') {
									new_expanded_url = iurl_expanded['expanded_url'];
									if((expanded_url=='')&&(new_expanded_url!='')){
										expanded_url = new_expanded_url;
									} else if (expanded_url!='') {
										expanded_url = expanded_url+'<br />'+new_expanded_url;
									}
								} else {
									if(iurl_expanded['media_url']) {
										console.log('MEDIA: '+ media_url);
										var embedded_media = '<div class="imgwrap" onclick="lightbox($(this));"><img src="'+iurl_expanded['media_url']+'" /></div>';
										if(media_url==''){
											media_url = embedded_media;
										} else {
											media_url = media_url + embedded_media;
										}
									}
								}
							}
						}
						if(media_url != '' ){
							render_url = media_url+render_url;
						}
					}
					console.info(data[i].p.twitter.data);
					if(data[i].p.twitter.data.extended_entity.urls){
						if(data[i].p.twitter.data.extended_entity.urls.length > 0){
							console.log('URL == ');
							console.info(data[i].p.twitter.data.extended_entity.urls[0].expanded_url);
							for(var iurl = 0; iurl < data[i].p.twitter.data.extended_entity.urls.length; iurl++){
								var new_expanded_url = data[i].p.twitter.data.extended_entity.urls[iurl];
								new_expanded_url = new_expanded_url['expanded_url'];
								if((expanded_url=='')&&(new_expanded_url!='')){
									expanded_url = '<a href="'+new_expanded_url+'" target="_blank">'+new_expanded_url+'</a>';
								} else if (expanded_url!='') {
									expanded_url = expanded_url+'<br /><a href="'+new_expanded_url+'" target="_blank">'+new_expanded_url+'</a>';
								}
								if(new_expanded_url.split('/')[2] == 'youtu.be'){
									render_url = render_url+'<div class="tweetEmbedWrap"><iframe width="360" height="240" src="http://www.youtube.com/embed/'+ new_expanded_url.split('/')[3].split('?')[0].split('&')[0] +'" frameborder="0" allowfullscreen></iframe></div>';
								} else if (new_expanded_url.split('/')[2] == 'vine.co') {
									render_url = render_url+'<div class="tweetEmbedWrap"><iframe src="http://vine.co/v/'+ new_expanded_url.split('/')[4]+'/card" height="360" width="360" frameborder="0"></iframe></div>';
								} else if (new_expanded_url.split('/')[2] == 'www.youtube.com') {
									render_url = render_url+'<div class="tweetEmbedWrap"><iframe width="360" height="240" src="http://www.youtube.com/embed/'+ new_expanded_url.split('/')[3].split('=')[1].split('&')[0] +'" frameborder="0" allowfullscreen></iframe></div>';
								} else {
									render_url = render_url+'<div class="row-spritz"><a class="spritz-control" onclick="spritzThis(\x27'+new_expanded_url+'\x27)"></a><div class="clearfix"></div><p class="spritz-caption click-to-spritz hidden-xs"><br /><a href="'+new_expanded_url+'" target="_blank">'+new_expanded_url+'</a></p></div>';
								}
							}
						}
					}

					var tweetDate = Date.parse(data[i].p.twitter.data.tweet_data[4]);
					var niceTweetDate = data[i].p.twitter.data.tweet_data[4].split(' ');
					$("#tweetList").append('<li style="display:none" class="responseRow" tweetdate="'+tweetDate+'" retweets="'+data[i].p.twitter.data.tweet_data[7]+'"><div><strong><a href="https://twitter.com/'+data[i].p.twitter.data.tweet_data[9]+'" target="_blank" class="twitter-username">@' + data[i].p.twitter.data.tweet_data[9] + '</a></strong> <span class="tweet-date">' + niceTweetDate[0] + ' ' + niceTweetDate[1] + ' ' + niceTweetDate[2] + ' ' + niceTweetDate[5] + ' ' + niceTweetDate[3] + '</span></div><div class="tweetBody">' + data[i].p.twitter.data.tweet_data[10] + '<div style="clear:both"></div></div><div class="expanded_urls">' + expanded_url + '</div><div class="render_url">' + render_url + '</div><div class="left"><span class="rts">Retweets: '+data[i].p.twitter.data.tweet_data[7]+'</span> <span class="favs">Favorites: '+data[i].p.twitter.data.tweet_data[6]+'</span></div><a href="https://twitter.com/'+data[i].p.twitter.data.tweet_data[9]+'/status/'+data[i].p.twitter.data.tweet_data[3]+'" class="twitterbird" target="_blank"></a></li>');
				}
				$('#tweetList li:hidden').fadeIn(fadeTimer);
				currentPage++;
				if(currentPage < totalPages) {
					$("#tweetList").append('<li class="more-link"><a href="javascript:wordSearch(\x27'+arch+'\x27,\x27'+ word +'\x27,\x27'+rpp+'\x27,\x27'+ currentPage +'\x27);">Load More (Page '+ currentPage +'/'+totalPages+')</a></li>');
					expandList = true;
				}				
				$('.tweetBody').linkify();
				$('.expanded_urls a').not('.scraped').each(function(){
					var extURL = $(this).attr('href');
					getLinkMeta(extURL);
				});		
				$('#wait').fadeOut(fadeTimer);
				$('#disabler').fadeOut(fadeTimer);
				if(window.scrollY == 0){
					$(window).scrollTop(5,0);
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				console.log(XMLHttpRequest);
				console.log(textStatus);
				console.log(errorThrown);
				librarianErr();
			}
		});
	}
}

// Timeline Playback
var playTimerId = 0;
var playCounter = 0;
var minVal;
var maxVal;

function autoPlayTimeline() {
	$('.playbtn').toggleClass('playing');
	$('#timeline-settings').fadeOut(fadeTimer);
	if (playingTimeline == false) {
		playingTimeline = true;
		$('#timeline .ui-rangeSlider-bar').addClass('animate');
		$('.playbtn').text('pause');
		playTimeline();
	} else {
		clearTimeout ( playTimerId );
		playingTimeline = false;
		$('#timeline .ui-rangeSlider-bar').removeClass('animate');
		$('.playbtn').text('play');
		playCounter = 0;
	}
}

function playTimeline() {
	clearTimeout ( playTimerId );
	var playbackInterval = parseInt($('.timeline-control-input[name="timeline-interval"]').val())*60*60*1000;
	var playbackDuration = parseInt($('.timeline-control-input[name="timeline-duration"]').val())*60*60*1000;
	var userStartDate = $('#timeline-settings .timeline-control-input[name="timeline-startDate"]').val();
	if (playCounter == 0) {
		if ( userStartDate != '' ) {			
			minVal = Date.parse(userStartDate);
			maxVal = minVal+playbackInterval;
		} else {
			if (Date.parse($("#timeline").dateRangeSlider("values").min)+playbackInterval == Date.parse($("#timeline").dateRangeSlider("values").max)) {
				minVal = Date.parse($("#timeline").dateRangeSlider("values").min)+playbackDuration;
				maxVal = minVal+playbackInterval;
			} else {
				minVal = Date.parse($("#timeline").dateRangeSlider("values").min);
				maxVal = Date.parse($("#timeline").dateRangeSlider("values").min)+playbackInterval;
			}
		}
	} else {
		minVal = minVal+playbackDuration;
		maxVal = maxVal+playbackDuration;
	}
	var basicSliderBounds = $("#timeline").dateRangeSlider("bounds");
	var endDate = Date.parse(basicSliderBounds.max);
	if (maxVal > endDate) {
		autoPlayTimeline();
		alert('End of Timeline');
		return false;
	}
	$("#timeline").dateRangeSlider("values", new Date(minVal), new Date(maxVal));
	playCounter++;
	timeChange();
}

// CLEAR MODAL
function clearModal() {
	$('main.wordCloud text').css({
		'text-shadow':'0 0 0 rgba(200,200,200,.5)',
		'opacity':'1',
		'-ms-filter': 'progid:DXImageTransform.Microsoft.Alpha(Opacity=100)',
		'filter':'alpha(opacity=100)',
		'-moz-opacity': '1',
		'-khtml-opacity': '1',
		'transition': 'all 1s ease',
		'-moz-transition': 'all 1s ease',
		'-webkit-transition': 'all 1s ease',
		'-o-transition': 'all 1s ease'
	});
	if (currentView.slice(0,7) == 'archive') {
		currentArchive = '*';
	}
	var stateObj = {
		archive: currentArchive,
		word: ''
	};
	var newURL = document.location.origin + document.location.pathname +'?startDate='+startDateValue+'&endDate='+endDateValue+'&archive='+encodeURIComponent(currentArchive);
	history.pushState(stateObj, 'Alexandria > '+currentArchive, newURL);
	document.title = 'Alexandria > '+currentArchive;
	currentPage = 0;
	totalPages = 0;
	$("#tweetList li").fadeOut(fadeTimer);
	$('.overlay').fadeOut(fadeTimer);
	$('.view-controls').fadeIn(fadeTimer);
	if (resetArchiveList == true) {
		if (currentView.slice(0,5) == 'words') {
			getArchiveWords(searchTerm);
		} else {
			getJobs(searchTerm);
		}
	}
	volumeBars(currentArchive,'',7200000);
	$("#tweetList li").remove();
	$('#timeline-controls').fadeIn(fadeTimer);
	return false;
}

// VOLUME BARS
function volumeBars(arch, word, interval){
	if (!arch) {
		arch = '*';
	}
	if (!word) {
		word = '';
	}
	if(!interval){
		var inverval = 7200000;
	}
	var w = window.innerWidth-1;
	var h = 80;
	var barPadding = 1;
	var dataset = [];	
	var basicSliderBounds = $("#timeline").dateRangeSlider("bounds");
	var queryString = '{"Archive":"'+arch+'","Word":"'+word+'","StartDate":'+Date.parse(basicSliderBounds.min)+',"EndDate":'+Date.parse(basicSliderBounds.max)+',"Interval": '+interval+'}';
	console.log('API call: get/interval/count ...');
	$.ajax({
		type: "POST",
		url: "http://"+ serverAddress +":3000/alexandria/v1/twitter/get/interval/count",
		data: queryString.toString(),
		success: function (e) {
			if ( $('#footer').css('display') == 'none' ) {
				console.log('Timeline not present. Aborting volume bar generation.');
				return false;
			}
			$('#volume.twitter-archive').show();
			console.log('volumeBars() Ajax: get/interval/count ... '+queryString);
			var data = $.parseJSON(e);
			$.each(data,function(t, v){
				dataset.push(v);
			});
			console.info(dataset);
	        clearInterval(volumeBarInterval);
		    if (dataset == "no archive found") {
				var volumeBarInterval = setInterval(function() {
					volumeBars(arch, word, interval);
					return false;
				}, 2000);
		    } else {
				$('svg#volume').remove();
				var largest = Math.max.apply(Math, dataset);
				var mostRecent = Math.max.apply(Math, Object.keys(data));
				// Difference between most recent and current time
				console.log('largest = '+ largest);
				console.log('mostRecent = '+ largest);
				console.log('Diff = '+((Date.parse(datetime))-mostRecent));
				console.log('interval = '+interval);
				if ( ( ( ( Date.parse(datetime) ) - mostRecent ) > interval*1.15 ) && (arch == '*') ) {
					console.log('Librarian stopped archiving!');
				} else {
					console.log('Librarian appears to be archiving');
				}
				var firstTimestamp = Math.min.apply(Math, Object.keys(data));
				var missingIntervals = ((Date.parse(basicSliderBounds.max))-mostRecent)/interval;
				// Fill in missing volume bars at end of timeline
				while (missingIntervals > 0) {
					data[Math.max.apply(Math, Object.keys(data))+interval] = 0;
					missingIntervals--;
				}
				// Draw bars
				if(missingIntervals == 0){
					var drawdata = [];
					$.each(data,function(t, v){
						drawdata.push(v);
					});
					//Create SVG element
					var svg = d3.select("body")
								.append("svg")
								.attr("width", "100%")
								.attr("id","volume")
								.attr("class","twitter-archive")
								.attr("height", h);
				
					svg.selectAll("rect")
					   .data(drawdata)
					   .enter()
					   .append("rect")
					   .attr("x", function(d, i) {
							return ((i * (w / drawdata.length))/w)*100+'%';
					   })
					   .attr("y", function(d) {
							return h - (h*(d/largest));
					   })
					   .attr("width", Math.abs(((w / drawdata.length - barPadding)/w)*100)+'%')
					   .attr("height", function(d) {
							return h*(d/largest);
					   })
					   .attr("fill", function(d) {
					   		var barFill = ((255-(Math.round((d/largest)*255 * 10)/10))*.75).toFixed(0);
							return "rgb("+barFill+", "+ barFill +", " + barFill + ")";
					   });
				}
			}
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			console.log(XMLHttpRequest);
			console.log(textStatus);
			console.log(errorThrown);
			librarianErr();
		}
	});
}

// LIGHTBOX FUNCTION
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

// infinite Scroll FUNCTION
function infiniteScroll() {	
	var loadScrollPosition = $('#tweetList').height()-(window.innerHeight*8);
	if ( (expandList == true) && (window.scrollY > loadScrollPosition) && (currentPage < totalPages) ) {
		console.info('currentPage = '+currentPage);
		console.info('totalPages = '+totalPages);
		expandList = false;
		wordSearch(currentArchive, activeWord, 40, currentPage);
	}
}

// SPRITZ
function spritzThis(extURL) {
	if ($('#spritz-container').css('display') != 'block') {
		$('#spritz-container').fadeIn(fadeTimer);
		$('#spritzer').data('controller').setUrl(extURL);
	}
}

/* ADD NEW CONTENT INTERFACE */
function resizeTabs() {
	var tabHeight = $('.modal-tab:visible').children().first().height();
	$('.modal-tab:visible').children().each(function(){
		var thisTabHeight = $(this).height();
		if (thisTabHeight > tabHeight) {
			tabHeight = thisTabHeight;
		}
	});
	$('#newMedia-tabs').css('height',tabHeight+'px');
}

// URL PARSING
function PageQuery(q) {
	if(q.length > 1) this.q = q.substring(1, q.length);
	else this.q = null;
	this.keyValuePairs = new Array();
	if(q) {
		for(var i=0; i < this.q.split("&").length; i++) {
			this.keyValuePairs[i] = this.q.split("&")[i];
		}
	}
	this.getKeyValuePairs = function() { return this.keyValuePairs; }
	this.getValue = function(s) {
		for(var j=0; j < this.keyValuePairs.length; j++) {
			if(this.keyValuePairs[j].split("=")[0] == s)
				return this.keyValuePairs[j].split("=")[1];
		}
		return false;
	}
	this.getParameters = function() {
		var a = new Array(this.getLength());
		for(var j=0; j < this.keyValuePairs.length; j++) {
			a[j] = this.keyValuePairs[j].split("=")[0];
		}
		return a;
	}
	this.getLength = function() { return this.keyValuePairs.length; } 
}
function queryString(key){
	var page = new PageQuery(window.location.search);
	return unescape(page.getValue(key)); 
}
function displayItem(key){
	if(queryString(key)=='false') {	
		console.log("you didn't enter a ?"+key+"=value querystring item.");
	} else {
		if (key == 'startDate') {
			startDateValue = queryString(key);
			$('.currentStartTime').text(new Date(parseInt(startDateValue)));
			displayItem('endDate');
		} else if(key == 'endDate'){
			endDateValue = queryString(key);
			$('.currentEndTime').text(new Date(parseInt(endDateValue)));
		} else if(key == 'archive'){
			currentArchive = queryString(key);
			$('.archiveLabel').fadeIn(fadeTimer);
			$('#viewlabel .currentArchive').text(currentArchive);
			searchTerm = currentArchive;
			currentView = 'wordsCloud';
			activeWord = '';
			if (window.location.search.indexOf("word") == -1) {
				document.title = 'Alexandria - '+currentArchive;
				getArchiveWords(currentArchive);
			} else {
				displayItem('word');
			}
		} else if (key == 'word') {
			activeWord = queryString(key);
			document.title = 'Alexandria - '+currentArchive+' - ' + activeWord;
			// VOLUME BARS FOR TWEETLIST
			wordSearch(currentArchive, activeWord, 40, 0);
			getArchiveWords(currentArchive);
		} else if (key == 'view') {
			currentView = queryString(key);
			if(currentView == 'addcontent'){
				loadShareMod();
				resetInterface();
			} else if(currentView == 'media'){
				$('#search').fadeIn(fadeTimer);
				$('#addNewContent-icon').fadeIn(fadeTimer);
				loadRecentMedia();
				resetInterface();
			}
		}		
	}
}

// BROWSER NAVIGATION CONTROLS
window.onpopstate = function(event) {
	if(window.location.search == ''){
		resetAlexandria();
	} else {
		freshLoad = false;
		$('#intro').fadeOut(fadeTimer);
		prevStartDate = startDateValue;
		prevEndDate = endDateValue;
		if (window.location.search.indexOf("startDate") > -1) {
			displayItem('startDate');
		}
		$('main.wordCloud text').css({
			'text-shadow':'0 0 0 rgba(200,200,200,.5)',
			'opacity':'1',
			'-ms-filter': 'progid:DXImageTransform.Microsoft.Alpha(Opacity=100)',
			'filter':'alpha(opacity=100)',
			'-moz-opacity': '1',
			'-khtml-opacity': '1',
			'transition': 'all 1s ease',
			'-moz-transition': 'all 1s ease',
			'-webkit-transition': 'all 1s ease',
			'-o-transition': 'all 1s ease'
		});
		$('#timeline-controls').fadeIn(fadeTimer);
		console.log('prevStartDate = '+ prevStartDate);
		console.log('startDateValue = '+ startDateValue);
		console.log('prevEndDate = '+ prevEndDate);
		console.log('endDateValue = '+ endDateValue);
		if ( ( (prevStartDate != '') && (prevEndDate != '') ) && ( (startDateValue != prevStartDate) || (endDateValue != prevEndDate) ) ) {
			$("#timeline").dateRangeSlider("values", startDateValue, endDateValue);
			timeChange();
		}
		$("#tweetList li").fadeOut(fadeTimer);
		$('.overlay').fadeOut(fadeTimer);
		$('.sharing-ui').fadeOut(fadeTimer);
		$("#tweetList li").remove();
		currentPage = 0;
		totalPages = 0;
		loadAlexandriaView();
	}
};
// Load Alexandria View
function loadAlexandriaView() {
	var readyStateCheckInterval = setInterval(function() {
	    if (document.readyState === "complete") {
	        clearInterval(readyStateCheckInterval);
			$('img.makesvg:hidden').show();
			if (window.location.search.indexOf("view") == -1) {
				$('#addNewContent-icon').fadeIn(fadeTimer);
			}
			if (window.location.search == '') {
				resetInterface();
		        $('#intro').fadeIn(fadeTimer);
			} else if (window.location.search.indexOf("archive") > -1) {
				if ($('#timeline').children().length == 0) {
					buildTimeline();
				}
				$('.twitter-archive').not('main').show();
				displayItem('archive');
			} else if (window.location.search.indexOf("startDate") > -1) {
				$('.twitter-archive').not('main').show();
				getJobs('');
			} else if (window.location.search.indexOf("view")  > -1) {
				displayItem('view');
			}
	    }
	}, 10);		    
}

// Load Local HTML file contents for info modal
function getInfoFile(localFile) {
	var localURL = 'modals/info-'+ localFile +'.html';
	$.ajax({
	    url: localURL,
	    type: 'GET',
	    success: function(res) {
			$('#info-modal-small').html(res);
	    }
	});
}

// External link meta data
function getLinkMeta(extURL) {
	$.ajax({
	    url: extURL,
	    type: 'GET',
	    success: function(res) {
	        var thisLink = $('.expanded_urls a[href="'+extURL+'"]').first();
	        if (!$(thisLink).hasClass('.scraped')){
				var extContent = $(res.responseText).find().prevObject;
				if ( $(extContent).filter('title').length > 0 ) {
					var linkTitle = $(extContent).filter('title')[0].text;
					if(!$(thisLink).parents('.expanded_urls').find('.extLinkTitle').length > 0) {
						if ( ( $(thisLink).next().attr('class') != 'extLinkTitle' ) && ( linkTitle != '' ) ) {
							$(thisLink).after('<div class="extLinkTitle"><a href="'+ extURL +'" target="_blank">'+linkTitle+'</a></div>');
						};
					}
				}
				if(extContent.length > 0){
					var linkMeta = $(extContent).filter('meta');
					var ogMeta = [];
					var twitterMeta = [];
					$(linkMeta).each(function(i){
						if ($(this).attr('name')){
							if ( ($(this).attr('name') == 'description') && ( $(thisLink).next().attr('class') == 'extLinkTitle' ) && ( $(thisLink).next().next().attr('class') != 'extLinkDesc' ) ) {
								if(!$(thisLink).parents('.expanded_urls').find('.extLinkDesc').length > 0) {
									var linkDesc = $(this).attr('content');
									$(thisLink).next().after('<div class="extLinkDesc">'+ linkDesc +' ... </div>');
								}
							} else if ( $(this).attr('name').slice(0,7) == 'twitter' ) {
								twitterMeta.push(this);
								if ( $(this).attr('name') == 'twitter:title' ) {
									// $(thisLink).after('<div class="extLinkTitle"><a href="'+ extURL +'" target="_blank"><span style="background-color:#000;color:#fff;">Twitter Title: '+$(this).attr('content')+'</span></a>');
								} else if ( $(this).attr('name') == 'twitter:description' ) {
									// $(thisLink).next().after('<div class="extLinkDesc"><span style="background-color:#000;color:#fff;">Twitter Description: '+$(this).attr('content')+'</span></div>');
								} else if ( ($(this).attr('name') == 'twitter:image:src') || ($(this).attr('name') == 'twitter:image') ) {
									if(!$(thisLink).parents('.expanded_urls').find('.extLinkTwitImg').length > 0) {
										$(thisLink).after('<div class="extLinkTwitImg imgwrap" onclick="lightbox($(this));"><img src="'+$(this).attr('content')+'" /></div>');
									}
								}

							} else if ( $(this).attr('name').slice(0,2) == 'og' ) {
								ogMeta.push(this);
								if ( $(this).attr('name') == 'og:title' ) {
									$(thisLink).next('.extLinkTitle').find('a').append(' - '+$(this).attr('content'));
								}
							}
						}
					});
					console.info(ogMeta);
					$.each(ogMeta,function(i, d){
						console.log('ogMeta == '+i);
						console.info(d);
					});
					console.info(twitterMeta);
					$.each(twitterMeta,function(i, d){
						console.log('twitterMeta == '+i);
						console.info(d);
					});

				}

				$(thisLink).addClass('scraped');
			}
	    }
	});
}
// External Link Content
function getLinkContent(extURL) {
	$.ajax({
	    url: extURL,
	    type: 'GET',
	    success: function(res) {
	        var thisLink = $('.expanded_urls a[href="'+extURL+'"]');
	    	var extContent = $(res.responseText).find().prevObject;
	    	extContent = extContent.find().prevObject;
	    	var extText = $(extContent).filter('text');
		}
	});
}

// RESET INTERFACE
function resetInterface() {
	// Reset Interface
	searchResults.length=0;
	searchResultsCache.length = 0;
	$('#wait').fadeOut(fadeTimer);
	$('#disabler').fadeOut(fadeTimer);
	$('.search').attr('disabled',false);
	if (playingTimeline == true) {
		// set a timer and step timline forward
		playTimerId = setTimeout ( 'playTimeline()', animDuration );
	}
}

// RESET ALEXANDRIA
function resetAlexandria() {
	$('main').hide(fadeTimer);
	$('#tip-modal').hide();
	$('#addNewContent-icon').show(fadeTimer);
	$('.sharing-ui').hide(fadeTimer);
	$('.view-media-ui'). hide(fadeTimer);
	$('#search').show(fadeTimer);
	$('.twitter-archive').not('main').hide();
	$('#app-shading').css('bottom','0');
	currentView = 'archiveCloud';
	$('#intro').fadeIn(fadeTimer);
	var stateObj = {
		currentView: currentView
	};
	var newURL = document.location.origin + document.location.pathname;
	history.pushState(stateObj, 'Alexandria', newURL);
	document.title = 'Alexandria';
}

// Hide Twitter Archives UI
function hideArchivesUI() {
	$('#intro').fadeOut(fadeTimer);
	$('.twitter-archive').fadeOut(fadeTimer);
	$('#app-shading').css('bottom',0);
	$('#app-overlay').hide();
}

// Recent Media View
function loadRecentMedia() {
	currentView = 'recentMediaList';
	$('main').fadeOut(fadeTimer);
	hideArchivesUI();
	$('#tip-modal').hide();
	$('.view-media-ui').fadeOut(fadeTimer);
	$('#browse-media').fadeIn(fadeTimer);
	$('#browse-media-wrap .row').first().addClass('first');
	// URL and Browser Nav for Recent Media Browse View
	currentView = 'media';
	var stateObj = {
		currentView: currentView,
		sort: 'recent'
	};
	var newURL = document.location.origin + document.location.pathname +'?view='+currentView+'&sort=recent';
	history.pushState(stateObj, 'Alexandria > Media', newURL);
	document.title = 'Alexandria > Media';
}
// Load Media Page
function loadMediaView(mediaType, mediaTitle, mediaMeta) {
	currentView = 'media';
	$('main').fadeOut(fadeTimer);
	hideArchivesUI();
	$('#tip-modal').hide();
	$('.view-media-ui').fadeIn(fadeTimer);
	$('#view-media .entity-view').hide();
	$('#view-media').fadeIn(fadeTimer);
	$('#media-view-'+mediaType).fadeIn(fadeTimer);
	// URL and Browser Nav for Media Entity View
	var stateObj = {
		currentView: currentView,
		mediaType: mediaType,
		mediaTitle: mediaTitle,
		mediaMeta: mediaMeta
	};
	var titleLower = mediaTitle.replace(/\s/g , "-").toLowerCase();
	var mediaMetaLower = mediaMeta.replace(/\s/g , "-").toLowerCase();
	var newURL = document.location.origin + document.location.pathname +'?view='+currentView+'&title='+encodeURIComponent(titleLower)+'&entity='+encodeURIComponent(mediaMetaLower);
	var newTitle = 'Alexandria > '+mediaTitle+' '+mediaMeta;
	history.pushState(stateObj, newTitle, newURL);
	document.title = newTitle;
}
// Display Media Info Modal
function loadInfoModal(childObj) {
    var testObj = childObj.parentNode;
    var count = 1;
    while ( !$(testObj).hasClass('media-entity') ) {
        testObj = testObj.parentNode;
        if (!testObj) {
			if ( ($('#info-modal-small').css('display') == 'block') && ($('#info-modal-small').css('opacity')==1) ) {
				$('#info-modal-small').fadeOut(fadeTimer);
				return false;
			} else {
				$('#info-modal-small').html('');
				var objMeta = $(childObj).parents('li');
				if ($(objMeta).find('#info-modal-small').length == 0) {
					$(objMeta).append($('#info-modal-small'));
				}
				var localFile = $(objMeta).find('label').text().replace(/\s/g , "-").toLowerCase();
				getInfoFile(localFile);
				$(objMeta).find('#info-modal-small').fadeIn(fadeTimer);
	        	return false;
			}
        }
        count++;
    }
	if ( ($('#info-modal-media').css('display') == 'block') && ($('#info-modal-media').css('opacity')==1) ) {
		$('#info-modal-media').fadeOut(fadeTimer);
		return false;
	}
	var objMeta = $(childObj).parents('.media-entity');
	if ($(objMeta).find('#info-modal-media').length == 0) {
		$(objMeta).append($('#info-modal-media'));
	}
	$('#info-modal-media .entity-meta-header h2').html($(objMeta).find('.media-title').html());
	$('#info-modal-media .entity-meta-header h3').html($(objMeta).find('.media-meta').html());
	$('#info-modal-media .entity-meta-header .entity-runtime').html($(objMeta).find('.media-runtime').html());
	$('#info-modal-media .media-image').html($(objMeta).find('.media-icon').html());
	$(objMeta).find('#info-modal-media').fadeIn(fadeTimer);
}
// Display Tip Modal
function loadTipModal(obj) {
	if ($(obj).parents('.entity-footer #tip-modal').length == 0) {
		$(obj).parents('.entity-footer').append($('#tip-modal'));
	}
	var tipModalPos = $(obj).position().left-31;
	$('#tip-modal .modal-tabs li:first-child').click();
	$(obj).parents('.entity-footer').find('#tip-modal').css('left',tipModalPos+'px').fadeToggle(fadeTimer);
}

// Share New Content Module
function loadShareMod() {
	currentView = 'addNewContent';
	var stateObj = {
		currentView: currentView
	};
	var newURL = document.location.origin + document.location.pathname +'?view=addcontent';
	history.pushState(stateObj, 'Alexandria > Add Content', newURL);
	document.title = 'Alexandria > Add Content';
	$('#addNewContent-icon').fadeOut(fadeTimer);
	$('#search').fadeOut(fadeTimer);
	$('main').not('.sharing-ui').fadeOut(fadeTimer);
	hideArchivesUI();
	$('.sharing-ui').fadeIn(fadeTimer);
	resizeTabs();
}
// Upload File
function uploadFile(elem) {
	var uploader = $(elem).attr('id');
	upclick({
		element: uploader,
		// action: '/path_to/you_server_script.php', 
		onstart: function(filename) {
			// alert('Start upload: '+filename);
			$('.'+uploader+' .media-filename').show().children('span').text(filename);
			resizeTabs();
		},
		oncomplete: function(response_data) {
			// alert(response_data);
		}
	});
}

// ERROR CONNECTING TO LIBRARIAN
function librarianErr(){
	console.error('Librarian Error');
}

// Interger sort order function
jQuery.fn.sortElements = (function(){
    var sort = [].sort;
    return function(comparator, getSortable) {
        getSortable = getSortable || function(){return this;};
        var placements = this.map(function(){
            var sortElement = getSortable.call(this),
                parentNode = sortElement.parentNode,
                // Since the element itself will change position, we have
                // to have some way of storing its original position in
                // the DOM. The easiest way is to have a 'flag' node:
                nextSibling = parentNode.insertBefore(
                    document.createTextNode(''),
                    sortElement.nextSibling
                ); 
            return function() {
                if (parentNode === this) {
                    throw new Error(
                        "You can't sort elements if any one is a descendant of another."
                    );
                }
                // Insert before flag:
                parentNode.insertBefore(this, nextSibling);
                // Remove flag:
                parentNode.removeChild(nextSibling);
            };
        });
        return sort.call(this, comparator).each(function(i){
            placements[i].call(getSortable.call(this));
        });
    };
})();

// Alphabetical sort
function sortUnorderedList(ul, sortDescending) {
	var mylist = $('#'+ul);
	var listitems = mylist.children('li').get();
	listitems.sort(function(a, b) {
	   return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
	})
	$.each(listitems, function(idx, itm) { mylist.append(itm); });
}

/*
* Replace all SVG images with inline SVG
*/
function replaceSVG() {
	jQuery('.makeChildrenSVG').each(function(){
		jQuery(this).children('img').each(function(){
			jQuery(this).addClass('makesvg');
		});
	});
	jQuery('img.makesvg').each(function(){
		var $img = jQuery(this);
		var imgID = $img.attr('id');
		var imgClass = $img.attr('class');
		var imgURL = $img.attr('src');

		jQuery.get(imgURL, function(data) {
			// Get the SVG tag, ignore the rest
			var $svg = jQuery(data).find('svg');
	
			// Add replaced image's ID to the new SVG
			if(typeof imgID !== 'undefined') {
				$svg = $svg.attr('id', imgID);
			}
			// Add replaced image's classes to the new SVG
			if(typeof imgClass !== 'undefined') {
				$svg = $svg.attr('class', imgClass+' replaced-svg');
			}
	
			// Remove any invalid XML tags as per http://validator.w3.org
			$svg = $svg.removeAttr('xmlns:a');
			
			// Replace image with new SVG
			$img.replaceWith($svg);

		}, 'xml');
	});
}

// Spinner configuration
var largeSpinConfig = {
	lines: 17, // The number of lines to draw
	length: 7, // The length of each line
	width: 1, // The line thickness
	radius: 10, // The radius of the inner circle
	corners: 1, // Corner roundness (0..1)
	rotate: 0, // The rotation offset
	direction: 1, // 1: clockwise, -1: counterclockwise
	color: '#000', // #rgb or #rrggbb or array of colors
	speed: .5, // Rounds per second
	trail: 34, // Afterglow percentage
	shadow: false, // Whether to render a shadow
	hwaccel: false, // Whether to use hardware acceleration
	className: 'spinner', // The CSS class to assign to the spinner
	zIndex: 2e9, // The z-index (defaults to 2000000000)
	top: '50%', // Top position relative to parent
	left: '50%' // Left position relative to parent
};
var target = document.getElementById('wait');
var spinner = new Spinner(largeSpinConfig).spin(target);

// Default browser font size for word cloud
document.emSize=function(pa){
	pa= pa || document.body;
	var who= document.createElement('div');
	var atts= {fontSize:'1em',padding:'0',position:'absolute',lineHeight:'1',visibility:'hidden'};
	for(var p in atts){
		who.style[p]= atts[p];
	}
	who.appendChild(document.createTextNode('M'));
	pa.appendChild(who);
	var fs= [who.offsetWidth,who.offsetHeight];
	pa.removeChild(who);
	return fs;
}
