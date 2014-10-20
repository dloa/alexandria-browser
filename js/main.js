jQuery(document).ready(function($){
	
	// Footer timeline contruct
	var days = ["0", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];

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
		console.log('newSearchValue: '+ newSearchValue+', searchValue: '+ searchValue);
		var code = e.keyCode || e.which; if (code == 32) {
			console.log('cannot search for empty space');
		} else if ( ( (newSearchValue != searchValue) && (searchValue != '') ) || (code == 16) ) {
			if (searchTimerId) {
				clearTimeout ( searchTimerId );
			}
			searchTimerId = setTimeout ( 'runSearch("'+ newSearchValue +'")', 2000 );
		} else {
			console.log('newSearchValue: '+ newSearchValue+', searchValue :'+ searchValue);
		}
	});

	// load active jobs on button click
	$('.getAllArchives').click(function(){
		getAllArchives();
		var startDate = new Date(2014, 8, 25);
		var endDate = new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate() + 1);
		$("#timeline").dateRangeSlider("values", startDate, endDate);
	});
	$('#logo').click(function(){
		document.location.reload(true);
	});
	$('#clearSearch').click(function(){
		$('header input.search').val('');
//		getAllArchives();
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
		$('main').not('#'+currentView).fadeOut(fadeTimer);
//		$('#archiveListView').fadeIn(fadeTimer);
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
		$('main #'+currentView).fadeIn(fadeTimer);
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
	// scan archives after timeline slider values change
	$("#timeline").bind("valuesChanged", function(e, data){
		searchTerm = $('header input.search').val();
		$('ul#tweetList li').remove();
		if($('#tweetListView').css('display') == 'block') {
			if((currentView == 'wordsListView')||(currentView == 'wordsCloud')){
				wordSearch(searchTerm, activeWord, 40, 0);
			} else {
				showTweetList(searchTerm);
			}
			resetArchiveList = true;
		} else {			
			if((currentView == 'wordsListView')||(currentView == 'wordsCloud')){
				getArchiveWords(searchTerm);
			} else {
				getActiveJobs(searchTerm);
			}
		}
	});
	
}); // End Document.Ready

// For todays date;
var datetime = new Date();

var fadeTimer = 100;

// Searching ...
var searchTimerId = 0;
var searchRunning;
var searchTerm;
var activeWord;
function runSearch(searchTerm) {
//	searchTerm = $('.search').val();
	clearTimeout ( searchTimerId );
	searchRunning = 0;
	console.log('running search ... ' + searchTerm);
	console.log('Current View: '+currentView);
	if($('#tweetListView').css('display') == 'block') {
		clearModal();
	}
	if((currentView == 'wordsListView')||(currentView == 'wordsCloud')){
		activeWord = $('.search').val();
		console.log('Search term: '+ searchTerm +', Active word: '+activeWord+', currentArchive: '+currentArchive);
		getArchiveWords(currentArchive,activeWord);
	} else {
		getActiveJobs(searchTerm);
	}
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
	seachTerm = arch;
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
var currentArchive;
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
				cloudlist.reverse();
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
						var archiveArray = [];
						$('#archiveCloud span').each(function(){
							archiveArray.push($(this).text());
						});
						if(jQuery.inArray( item, archiveArray ) > -1) {
							$('main').fadeOut(fadeTimer);
							$('header input.search').val(item);
							currentArchive = item;
							searchTerm = item;
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
				// Volume Bars


			//Width and height
			var w = window.innerWidth-1;
			var h = 100;
			var barPadding = 1;
			
			var dataset = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
							11, 12, 15, 20, 18, 17, 16, 18, 23, 25, 30, 7, 14, 12, 27 ];
			
			//Create SVG element
			var svg = d3.select("body")
						.append("svg")
						.attr("width", w)
						.attr("id","volume")
						.attr("height", h);

			svg.selectAll("rect")
			   .data(dataset)
			   .enter()
			   .append("rect")
			   .attr("x", function(d, i) {
			   		return i * (w / dataset.length);
			   })
			   .attr("y", function(d) {
			   		return h - (d * 3);
			   })
			   .attr("width", w / dataset.length - barPadding)
			   .attr("height", function(d) {
			   		return d * 3;
			   })
			   .attr("fill", function(d) {
					return "rgb(0, 0, " + (d * 10) + ")";
			   });

			svg.selectAll("text")
			   .data(dataset)
			   .enter()
			   .append("text")
			   .text(function(d) {
			   		return d;
			   })
			   .attr("text-anchor", "middle")
			   .attr("x", function(d, i) {
			   		return i * (w / dataset.length) + (w / dataset.length - barPadding) / 2;
			   })
			   .attr("y", function(d) {
			   		return h - (d * 3) + 14;
			   })
			   .attr("font-family", "sans-serif")
			   .attr("font-size", "11px")
			   .attr("fill", "white");


			
				$('#wait').fadeOut(fadeTimer);
				$('.search').attr('disabled',false);
			}
		}
	});
}
// Get top words in archive and construct cloud
function getArchiveWords(arch, filterword) {
	if(!arch){
			console.log('No archive title!');
	} else {
		$('#wordsCloud').css('z-index','0').show();
		$('.wordCloud').children().remove();
		$('main article ul li').remove();
		console.log(currentView);
		// Loading spinner	
		$('#wait').fadeIn(fadeTimer);
		$('#view-controls').fadeOut(fadeTimer);
		$('.sort-link').fadeOut(fadeTimer);
		var dateValues = $("#timeline").dateRangeSlider("values");
		if (!filterword) {
			var queryString = '{"Archive": "'+ arch +'","StartDate": '+Date.parse(dateValues.min)/1000+',"EndDate": '+Date.parse(dateValues.max)/1000+',"MaxResults": 50,"FilterStopWords": true}';
		} else {
			var queryString = '{"Archive": "'+ arch +'","StartDate": '+Date.parse(dateValues.min)/1000+',"EndDate": '+Date.parse(dateValues.max)/1000+',"MaxResults": 50,"FilterStopWords": true,"FilterWord":"'+filterword+'"}';
			console.log(queryString);
		}
		$.ajax({
			type: "POST",
			url: "http://blue.a.blocktech.com:3000/alexandria/v1/twitter/get/archive/betweenDates/wordcloud",
			data: queryString.toString(),
			success: function (e) {
				$('#wordsCloud').css('z-index','0').show();
				$('.wordCloud').children().remove();
				var data = $.parseJSON(e);
				var cloudlist = [];
				var wordsArray = [];
				// Load words
				$.each(data,function(word, weight){
					$("#wordsList").append('<li class="responseRow" volume="'+weight+'"><a href="#" onclick="wordSearch(&quot;'+searchTerm+'&quot;, &quot;'+word+'&quot;, 40, 0);"><span>' + word + '</span> <span class="archive-volume">'+ weight +'</span></a></li>');
				});
				$('#wordsList li').sortElements(function(a, b){
					return parseInt($(a).attr('volume')) < parseInt($(b).attr('volume')) ? 1 : -1;
				});
				$('#wordsList').addClass('pop-sort');
				$('.sort-link').text('Popular');
				$('#wordsList li').each(function(){
					var archWeight = $(this).index();
					cloudlist.push([$(this).find('span:first-child').text(),archWeight+8]);
					wordsArray.push($(this).find('span:first-child').text());
				});
				$('#wordsListView').css('height',$('#wordsList').height()+100+'px');
				$('#wordsCloud').fadeIn(fadeTimer);
				cloudlist.reverse();
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
						activeWord = item;
						// currentArchive = item;
						if(jQuery.inArray( item, wordsArray ) > -1) {
							console.log('Active word: '+activeWord);
							var arch = $('header input.search').val();
							if(arch!=''){
								console.log(searchTerm);
								wordSearch(searchTerm, item, 40, 0)
								// showTweetList(item);
							}
						} else {
							console.log(wordsArray);
						}
					}
				});
				$('#wordsListView').css('height',$('#archiveList').height()+100+'px');
				currentView = 'wordsCloud';
				$('#wordsCloud').hide().css('z-index','3');
				$('.view-controls').fadeIn(fadeTimer);				
				$('main#'+currentView).fadeIn(fadeTimer);
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
	resetArchiveList = false;
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

function clearModal() {
	currentPage = 0;
	$("#tweetList li").remove();
	$('.overlay').fadeOut(fadeTimer);
//	$('.search').attr('disabled','disabled').val(searchTerm).attr('disabled',false);
	$('main').not('#'+currentView).fadeOut(fadeTimer);
	$('.view-controls').fadeIn(fadeTimer);
	if (resetArchiveList == true) {
//		$('header input.search').val(searchValue);				
		if((currentView == 'wordsListView')||(currentView == 'wordsCloud')){
			getArchiveWords(searchTerm);
		} else {
			getActiveJobs(searchTerm);
		}
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
