jQuery(document).ready(function($){
	
	// Footer timeline contruct
	var days = ["0", "Sept 1", "Sept 2", "Sept 3", "Sept 4", "Sept 5", "Sept 6", "Sept 7", "Sept 8", "Sept 9", "Sept 10", "Sept 11", "Sept 12", "Sept 13", "Sept 14", "Sept 15", "Sept 16", "Sept 17", "Sept 18", "Sept 19", "Sept 20", "Sept 21", "Sept 22", "Sept 23", "Sept 24", "Sept 25", "Sept 26", "Sept 27", "Sept 28", "Sept 29", "Sept 30", "Oct 1", "Oct 2", "Oct 3", "Oct 4", "Oct 5", "Oct 6", "Oct 7", "Oct 8", "Oct 9", "Oct 10"];

	$("#timeline").dateRangeSlider({
		bounds: {min: new Date(2014, 8, 25), max: new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate() + 1)},
		defaultValues: {min: new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate() - 1), max: new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate())},
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
	
	// Search box
	$('header input.search').on("keydown", function (e) {
		searchValue = $('header input.search').val();
		if($('#tweetListView').css('display') == 'block') {
			resetArchiveList == true;
		}
	});
	$('header input.search').on("keyup", function (e) {
		newSearchValue = $('header input.search').val();
		var code = e.keyCode || e.which; if (code == 32) {
			console.log('cannot search for empty space');
		} else if ( ( (newSearchValue != searchValue) && (searchValue != '') ) || (code == 16) ) {
			if (searchTimerId) {
				clearTimeout ( searchTimerId );
			}
			searchTimerId = setTimeout ( 'runSearch()', 2000 );
		}
	});

	// load active jobs on button click
	$('.getAllArchives').click(function(){
		getAllArchives();
		var startDate = new Date(2014, 8, 25);
		var endDate = new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate() + 1);
		$("#timeline").dateRangeSlider("values", startDate, endDate);
	});
	$('#clearSearch').click(function(){
		$('header input.search').val('');
		getAllArchives();
		runSearch('')
	});
	
	// View Controls
	$('.view-controls .view-link').click(function(){		
		var newView;
		$('main').fadeOut(fadeTimer);
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
		$('main').fadeOut(fadeTimer);
		$('#archiveListView').fadeIn(fadeTimer);
		$('#archiveList').toggleClass('pop-sort');
		if($('#archiveList').hasClass('pop-sort')){
			$('#archiveList li').sortElements(function(a, b){
				return parseInt($(a).attr('volume')) < parseInt($(b).attr('volume')) ? 1 : -1;
			});
			$(this).text('Popular');
		} else {
			sortUnorderedList("archiveList");
			$(this).text('Alphabetical');
		}
	});

	// Sort - Tweet List
	$('#resort').click(function(){
		$('main').fadeOut(fadeTimer);
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
	
	// Modal controls
	$(document).on("keyup", function (e) {
		var code = e.keyCode || e.which; if (code == 27) {
			if($('#wait').css('display') == 'block') {
				$('#wait').hide();
			}
			clearModal();
		}
	});

	$('.close-modal').click(function(){
		clearModal();
	});
	
}); // End Document.Ready

// For todays date;
var datetime = new Date();

var fadeTimer = 100;

// Searching ...
var searchTimerId = 0;
var searchRunning;
var searchTerm;
function runSearch() {
	if ( (currentView == 'wordsCloud') || (currentView == 'wordsCloudListView') ) {
		clearTimeout ( searchTimerId );
		searchRunning = 0;
		return false;
	}

	searchTerm = $('.search').val();
	if($('#tweetListView').css('display') == 'block') {
		clearModal();
	}
	getActiveJobs(searchTerm);
	clearTimeout ( searchTimerId );
	searchRunning = 0;
}
// function to get active jobs JSON object
var archTitleSpan = 'span:first-child';
function getActiveJobs(searchTerm) {
	resetArchiveList = false;
	if (!searchTerm) {
		var searchTerm = '';
	}
    $('#intro').remove();
	$('.search').attr('disabled','disabled');
	$('main').fadeOut(fadeTimer);
	if ((currentView == 'archiveListView') || (currentView == 'wordListView') ) {
		$('#'+currentView.slice(0,-8)+'Cloud').children().remove();
		$('#'+currentView+' li').remove();
	} else {
		$('#'+currentView.slice(0,-5)+'ListView li').remove();
		$('#'+currentView).children().remove();
	}
	$('#wait').fadeIn(fadeTimer);
	$.ajax({
		type: "GET",
		url: "http://blue.a.blocktech.com:3000/alexandria/v1/twitter/get/activejobs",
		success: function (responseData) {
			console.log('running search ... ' + searchTerm);
			console.log('Current View: '+currentView);
			var data = $.parseJSON(responseData);
			for (var i = 0; i < data['Jobs'].length; i++) {

				if(!searchTerm){
					$("#archiveList").append('<li id="archive-'+data['Jobs'][i].replace(/ /g,"-")+'"><a href="#" onclick="showTweetList($(this).find(archTitleSpan).text())"><span>' + data['Jobs'][i] + '</span> <span class="archive-volume"></span></a></li>');
					getArchiveVolume(data['Jobs'][i]);
				} else {
					var titleSlice = data['Jobs'][i].slice(0,searchTerm.length);
					if(titleSlice.toLowerCase() == searchTerm.toLowerCase()) {
						$("#archiveList").append('<li id="archive-'+data['Jobs'][i].replace(/ /g,"-")+'"><a href="#" onclick="showTweetList($(this).find(archTitleSpan).text())"><span>' + data['Jobs'][i] + '</span> <span class="archive-volume"></span></a></li>');
						getArchiveVolume(data['Jobs'][i]);
					}
				}
				
			}
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			// alert("some error");
			console.log(XMLHttpRequest);
			console.log(textStatus);
			console.log(errorThrown);
			$("#archiveList li").remove();
			$('header input.search').attr('disabled','disabled').css({background:'none #efefef',padding:'3px 15px',width:'14em'}).val('Cannot connect to Librarian').next().hide();			
			$('#wait').fadeOut(fadeTimer);
			$('#timeline').fadeOut(fadeTimer);
			$('#app-shading').css('bottom',0);
			alert('Cannot connect to Librarian');
	   }
	});
}
var resetArchiveList = false;

function getAllArchives(){
	searchValue = '';		
	$('header input.search').val(searchValue);
}

// show tweets in archive
var searchValue = '';
var newSearchValue = '';
function showTweetList(arch){
	if($('#tweetListView').css('display') != 'block') {
		// $('main').not('#'+currentView).fadeOut(fadeTimer);
		$('.view-controls').fadeOut(fadeTimer);
		searchValue = $('header input.search').val();
		if (searchValue != arch) {
			$('header input.search').val(arch);
			// resetArchiveList = true;
		}
		$('.overlay').fadeIn(fadeTimer);
	}
	getArchive(arch);
	if($('#resort').text() == 'Popular') {
		$('#tweetListView').addClass('pop-sort');
	}
}
// get archived tweets JSON object
var currentPage = 0;
var totalPages = 0;
function getArchive(arch) {
	// Loading spinner
	$('#wait').fadeIn(fadeTimer);
	var dateValues = $("#timeline").dateRangeSlider("values");
	var queryString = '{"Archive": "'+ arch +'","StartDate": '+Date.parse(dateValues.min)/1000+',"EndDate": '+Date.parse(dateValues.max)/1000+',"ResultsPerPage": 40}';
	// Count the pages
    $.ajax({
        type: "POST",
        url: "http://blue.a.blocktech.com:3000/alexandria/v1/twitter/get/archive/betweenDates/paginated/count",
        // Get tweets between two dates
		data: queryString.toString(),
        success: function (e) {
			totalPages = $.parseJSON(e);
        },
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			alert("some error");
			console.log(XMLHttpRequest);
			console.log(textStatus);
			console.log(errorThrown);
	   }
    });
	
	// Run query
    // Get tweets between two dates
	var queryString = '{"Archive": "'+ arch +'","StartDate": '+Date.parse(dateValues.min)/1000+',"EndDate": '+Date.parse(dateValues.max)/1000+',"ResultsPerPage": 40,"Page":'+currentPage+'}';
    $.ajax({
        type: "POST",
        url: "http://blue.a.blocktech.com:3000/alexandria/v1/twitter/get/archive/betweenDates/paginated",
		data: queryString.toString(),
        success: function (e) {
			var data = $.parseJSON(e);
			// Load tweets
			for (var i = 0; i < data.length; i++) {
				var tweetDate = Date.parse(data[i].p.twitter.data[4]);
				var niceTweetDate = data[i].p.twitter.data[4].split(' ');
				$("#tweetList").append('<li class="responseRow" tweetdate="'+tweetDate+'" retweets="'+data[i].p.twitter.data[7]+'"><div><strong><a href="https://twitter.com/'+data[i].p.twitter.data[9]+'" target="_blank" class="twitter-username">@' + data[i].p.twitter.data[9] + '</a></strong> <span class="tweet-date">' + niceTweetDate[0] + ' ' + niceTweetDate[1] + ' ' + niceTweetDate[2] + ' ' + niceTweetDate[5] + ' ' + niceTweetDate[3] + '</span></div><div class="tweetBody">' + data[i].p.twitter.data[10] + '</div><div style="clear:both"></div><div class="left"><span class="rts">Retweets: '+data[i].p.twitter.data[7]+'</span> <span class="favs">Favorites: '+data[i].p.twitter.data[6]+'</span></div><a href="https://twitter.com/'+data[i].p.twitter.data[9]+'/status/'+data[i].p.twitter.data[3]+'" class="twitterbird" target="_blank"></a></li>');
			}
			if($('#tweetList').hasClass('pop-sort')){
				$('#tweetList li').sortElements(function(a, b){
					return parseInt($(a).attr('retweets')) < parseInt($(b).attr('retweets')) ? 1 : -1;
				});
			} else {
				$('#tweetList li').sortElements(function(a, b){
					return $(a).attr('tweetDate') < $(b).attr('tweetDate') ? 1 : -1;
				});
			}
			$("#tweetList li.more-link").remove();
			currentPage++;
			if(currentPage < totalPages) {
				$("#tweetList").append('<li class="more-link"><a href="javascript:getArchive(\x27'+ arch +'\x27);">Load More (Page '+ currentPage +'/'+totalPages+')</a></li>');
			}
		$('#wait').fadeOut(fadeTimer);
        }
    });
}
// get archive volume and construct word cloud
var spinnerCount = 0;
var cloudlist = [];
var currentView = 'archiveCloud';
function getArchiveVolume(arch) {
	if(spinnerCount == 0) {
		$('main').fadeOut(fadeTimer);
		$('#wait').fadeIn(fadeTimer);
	}
	spinnerCount++;
	var dateValues = $("#timeline").dateRangeSlider("values");
	var queryString = '{"Archive": "'+ arch +'","StartDate": '+Date.parse(dateValues.min)/1000+',"EndDate": '+Date.parse(dateValues.max)/1000+'}';
	$.ajax({
		type: "POST",
		url: "http://blue.a.blocktech.com:3000/alexandria/v1/twitter/get/archive/betweenDates/count",
		data: queryString.toString(),
		success: function (e) {
			var data = $.parseJSON(e);
			spinnerCount--;
			if (data==0) {
				$('#archiveList li#archive-'+ arch.replace(/ /g,"-")).remove();				
			} else {
				$('#archiveList li#archive-'+ arch.replace(/ /g,"-") +' span.archive-volume').html(data);
				$('#archiveList li#archive-'+ arch.replace(/ /g,"-")).attr('volume',data);
			}
			if(spinnerCount == 0) {
				$('#archiveList li').each(function(){
					if($(this).find('span.archive-volume').html()==''){
						$(this).remove();
					}
				});
				$('main').fadeOut(fadeTimer);
				$('#'+currentView).fadeIn(fadeTimer);
				$('#archiveListView').css('height',$('#archiveList').height()+100+'px');
				var cloudlist = [];
				$('#archiveList li').sortElements(function(a, b){
					return parseInt($(a).attr('volume')) > parseInt($(b).attr('volume')) ? 1 : -1;
				});
				$('#archiveList li').each(function(){
					var archWeight = $(this).index()+5;
					cloudlist.push([$(this).find('span:first-child').text(),archWeight]);
				});
				if($('#archiveListView li').length == 0) {
					$("#archiveList").append('<li id="no-results"><a href="javascript:void(0);"><span>No Archives</span></li>');					
				}
				if ((currentView == 'archiveListView') || (currentView == 'wordListView') ) {
					// Build cloud behind the scenes
					$('#'+currentView.slice(0,-8)+'Cloud').css('z-index','0').fadeIn(fadeTimer);
				}
				WordCloud(document.getElementById('archiveCloud'), {
					list:cloudlist,
					gridSize: 20,
  					minSize: 4,
  					weightFactor: 5,
  					color: function (word, weight) {
  						if (weight === 5) { return '#222222' }
					    else if (weight === 6) { return '#333333' }
					    else if (weight === 7) { return '#444444' }
					    else if (weight === 8) { return '#555555' }
					    else if (weight === 9) { return '#666666' }
					    else if (weight === 10) { return '#777777' }
					    else if (weight === 11) { return '#888888' }
					    else if (weight === 12) { return '#999999' }
					    else if (weight === 13) { return '#aaaaaa' }
					    else if (weight === 14) { return '#bbbbbb' }
					    else { return '#cccccc' };
					},
					backgroundColor:'transparent',
					minRotation:0,
					maxRotation:0,
					click: function(item) {
						$('main').fadeOut(fadeTimer);
						var arr = [];
						$('#archiveCloud span').each(function(){
							arr.push($(this).text());
						});
						if(jQuery.inArray( item, arr ) > -1) {
							$('header input.search').val(item);
							getArchiveWords(item);
//							showTweetList(item);
						}
					}
				});
				if($('#resort-archView').text() == 'Popular') {
					$('#archiveList').addClass('pop-sort');
					$('#archiveList li').sortElements(function(a, b){
						return parseInt($(a).attr('volume')) < parseInt($(b).attr('volume')) ? 1 : -1;
					});
				} else {
					sortUnorderedList("archiveList");
				}
				if ((currentView == 'archiveListView') || (currentView == 'wordListView') ) {
					// Build cloud behind the scenes
					$('#'+currentView.slice(0,-8)+'Cloud').hide().css('z-index','3');
				}
				$('.view-link').fadeIn(fadeTimer);
				$('#wait').fadeOut(fadeTimer);
				$('.search').attr('disabled',false);
			}
		}
	});
}
// Get top words in archive and construct cloud
function getArchiveWords(arch) {
	if(! arch){
		console.log('No archive title!');
	} else {
		// Loading spinner	
		$('#wait').fadeIn(fadeTimer);
		$('#view-controls').fadeOut(fadeTimer);
		$('.sort-link').fadeOut(fadeTimer);
		$('#wordsCloud').children().remove();
		$('#wordsCloud').css('z-index','0').fadeIn(fadeTimer);
		var dateValues = $("#timeline").dateRangeSlider("values");
		var queryString = '{"Archive": "'+ arch +'","StartDate": '+Date.parse(dateValues.min)/1000+',"EndDate": '+Date.parse(dateValues.max)/1000+',"MaxResults": 50,"FilterStopWords": true}';
		$.ajax({
			type: "POST",
			url: "http://blue.a.blocktech.com:3000/alexandria/v1/twitter/get/archive/betweenDates/wordcloud",
			data: queryString.toString(),
			success: function (e) {
				var data = $.parseJSON(e);
				// Load words
				$.each(data,function(word, weight){
					$("#wordsList").append('<li class="responseRow" volume="'+weight+'">'+word+'</li>');
				});
				$('#wordsList li').sortElements(function(a, b){
					return parseInt($(a).attr('volume')) < parseInt($(b).attr('volume')) ? 1 : -1;
				});
				$('#wordsList li').each(function(){
					var archWeight = $(this).index();
					cloudlist.push([$(this).text(),archWeight+8]);
				});
				$('#wordsListView').css('height',$('#wordsList').height()+100+'px');
				$('#wordsCloud').fadeIn(fadeTimer);
				WordCloud(document.getElementById('wordsCloud'), {
					list:cloudlist,
					gridSize: 15,
  					minSize: 7,
					color: function (word, weight) {
						if ((weight > 9) && (weight < 15)) { return '#222222' }
						else if ((weight > 14) && (weight < 20)) { return '#333333' }
						else if ((weight > 19) && (weight < 25)) { return '#444444' }
						else if ((weight > 24) && (weight < 30)) { return '#555555' }
						else if ((weight > 29) && (weight < 35)) { return '#666666' }
						else if ((weight > 34) && (weight < 40)) { return '#777777' }
						else if ((weight > 39) && (weight < 45)) { return '#888888' }
						else if ((weight > 44) && (weight < 50)) { return '#999999' }
						else if ((weight > 49) && (weight < 55)) { return '#aaaaaa' }
						else if ((weight > 54) && (weight < 60)) { return '#bbbbbb' }
						else { return '#cccccc' };
					},
					backgroundColor:'transparent',
					minRotation:0,
					maxRotation:0,
					click: function(item) {
						var arr = [];
						$('#wordsList li').each(function(){
							arr.push($(this).text());
						});
						if(jQuery.inArray( item, arr ) > -1) {
							var arch = $('header input.search').val();
							if(arch!=''){
								wordSearch(arch, item, 40, 0)
								// showTweetList(item);
							}
						}
					}
				});
				$('#wordsListView').css('height',$('#archiveList').height()+100+'px');
				currentView = 'wordsCloud';
				$('#wordsCloud').hide().css('z-index','3');
				$('.view-controls').fadeIn(fadeTimer);
				$('#wordsCloud').fadeIn(fadeTimer);
				$('#wait').fadeOut(fadeTimer);
			}
		});
	}
}
function getWordCount(arch, word) {
	if((!arch)||(!word)){
		console.log(arch + ', ' + word);
		alert('error in getWordCount');
		return false;
	} else {
		var dateValues = $("#timeline").dateRangeSlider("values");	
		var queryString = '{"Archive":"'+arch+'","Word":"'+word+'","StartDate":'+Date.parse(dateValues.min)/1000+',"EndDate":'+Date.parse(dateValues.max)/1000+'}';
		$.ajax({
			type: "POST",
			url: "http://blue.a.blocktech.com:3000/alexandria/v1/twitter/get/tweets/betweenDates/wordsearch/count",
			data: queryString.toString(),
			success: function (e) {
				var data = $.parseJSON(e);
				$('#wait').fadeOut(fadeTimer);
			}
		});
	}
}

function wordSearch(arch, word, rpp, currentPage) {
	var pageFix = currentPage+1;
	if((!arch)||(!word)||(!rpp)||(!pageFix)){
		console.log(arch + ', ' + word + ', ' + rpp + ', ' + pageFix);
		if(!arch){console.log('arch!')}else if(!word){console.log('word!')}else if(!rpp){console.log('rpp = '+rpp)}else if(!pageFix){console.log('pageFix = '+pageFix)}else{console.log('something else!')}
		alert('error in wordSearch');		
		return false;
	} else {
		var dateValues = $("#timeline").dateRangeSlider("values");	
		var queryString = '{"Archive":"'+arch+'","Word":"'+word+'","StartDate":'+Date.parse(dateValues.min)/1000+',"EndDate":'+Date.parse(dateValues.max)/1000+',"ResultsPerPage": '+rpp+'}';
		$.ajax({
			type: "POST",
			url: "http://blue.a.blocktech.com:3000/alexandria/v1/twitter/get/tweets/betweenDates/wordsearch/pagecount",
			data: queryString.toString(),
			success: function (e) {
				totalPages = $.parseJSON(e);
				$('#wait').fadeOut(fadeTimer);
			}
		});
		var queryString = '{"Archive": "'+arch+'","Word": "'+word+'","StartDate": '+Date.parse(dateValues.min)/1000+',"EndDate": '+Date.parse(dateValues.max)/1000+',"ResultsPerPage": '+rpp+',"Page": '+ currentPage +'}';
		$.ajax({
			type: "POST",
			url: "http://blue.a.blocktech.com:3000/alexandria/v1/twitter/get/tweets/betweenDates/wordsearch",
			data: queryString.toString(),
			success: function (e) {
				var data = $.parseJSON(e);
				// Load tweets
				for (var i = 0; i < data.length; i++) {
					var tweetDate = Date.parse(data[i].p.twitter.data[4]);
					var niceTweetDate = data[i].p.twitter.data[4].split(' ');
					$("#tweetList").append('<li class="responseRow" tweetdate="'+tweetDate+'" retweets="'+data[i].p.twitter.data[7]+'"><div><strong><a href="https://twitter.com/'+data[i].p.twitter.data[9]+'" target="_blank" class="twitter-username">@' + data[i].p.twitter.data[9] + '</a></strong> <span class="tweet-date">' + niceTweetDate[0] + ' ' + niceTweetDate[1] + ' ' + niceTweetDate[2] + ' ' + niceTweetDate[5] + ' ' + niceTweetDate[3] + '</span></div><div class="tweetBody">' + data[i].p.twitter.data[10] + '</div><div style="clear:both"></div><div class="left"><span class="rts">Retweets: '+data[i].p.twitter.data[7]+'</span> <span class="favs">Favorites: '+data[i].p.twitter.data[6]+'</span></div><a href="https://twitter.com/'+data[i].p.twitter.data[9]+'/status/'+data[i].p.twitter.data[3]+'" class="twitterbird" target="_blank"></a></li>');
				}
				if($('#tweetList').hasClass('pop-sort')){
					$('#tweetList li').sortElements(function(a, b){
						return parseInt($(a).attr('retweets')) < parseInt($(b).attr('retweets')) ? 1 : -1;
					});
				} else {
					$('#tweetList li').sortElements(function(a, b){
						return $(a).attr('tweetDate') < $(b).attr('tweetDate') ? 1 : -1;
					});
				}
				$("#tweetList li.more-link").remove();
				currentPage++;
				if(currentPage < totalPages) {
					$("#tweetList").append('<li class="more-link"><a href="javascript:wordSearch(\x27'+arch+'\x27,\x27'+word+'\x27,\x27'+rpp+'\x27,\x27'+ currentPage +'\x27);">Load More (Page '+ currentPage +'/'+totalPages+')</a></li>');
				}
				$('main').not('#'+currentView).not('#tweetListView').fadeOut(fadeTimer);
				$('.view-controls').fadeOut(fadeTimer);
				$('.overlay').fadeIn(fadeTimer);
				$('#tweetListView').fadeIn(fadeTimer);
				$('#wait').fadeOut(fadeTimer);
			}
		});
	}
}
/*
function getWordPageCount(arch, word, rpp) {
	if((!arch)||(!word)||(!rpp)){
		console.log(arch + ', ' + word+ ', '+rpp);
		if(!arch){console.log('arch!')}else if(!word){console.log('word!')}else if(!rpp){console.log('rpp = '+rpp)}else{console.log('something else!')}
		alert('error in wordSearch');		
		return false;
	} else {
		var dateValues = $("#timeline").dateRangeSlider("values");	
		var queryString = '{"Archive":"'+arch+'","Word":"'+word+'","StartDate":'+Date.parse(dateValues.min)/1000+',"EndDate":'+Date.parse(dateValues.max)/1000+',"ResultsPerPage": '+rpp+'}';
		$.ajax({
			type: "POST",
			url: "http://blue.a.blocktech.com:3000/alexandria/v1/twitter/get/tweets/betweenDates/wordsearch/pagecount",
			data: queryString.toString(),
			success: function (e) {
				var totalPages = $.parseJSON(e);
				return totalPages;
				$('#wait').fadeOut(fadeTimer);
			}
		});
	}
}
*/

// scan archives after timeline slider values change
$("#timeline").bind("valuesChanged", function(e, data){
	searchTerm = $('header input.search').val();
	if($('#tweetListView').css('display') == 'block') {
		$('ul#tweetList li').remove();
		showTweetList(searchTerm);
		resetArchiveList = true;
	} else {
		getActiveJobs(searchTerm);
	}
});
function clearModal() {
	currentPage = 0;
	$("#tweetList li").remove();
	$('.overlay').fadeOut(fadeTimer);
//	$('.search').attr('disabled','disabled').val(searchTerm).attr('disabled',false);
	$('main').not('#'+currentView).fadeOut(fadeTimer);
	$('.view-controls').fadeIn(fadeTimer);
	if (resetArchiveList == true) {
		$('header input.search').val(searchValue)
		getActiveJobs(searchValue);
	} else {
		if ( (searchValue) && (searchTerm == searchValue) && (searchValue == newSearchValue) )  {
			$('.search').val(searchValue);
		}
	}
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

// Spinner configuration
var largeSpinConfig = {
	lines: 17, // The number of lines to draw
	length: 40, // The length of each line
	width: 4, // The line thickness
	radius: 60, // The radius of the inner circle
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
