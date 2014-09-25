jQuery(document).ready(function($){
	
	$('#resort').click(function(){
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

	// For todays date;
	var datetime = new Date();
	// Footer timeline contruct
	var days = ["0", "Sept 1", "Sept 2", "Sept 3", "Sept 4", "Sept 5", "Sept 6", "Sept 7", "Sept 8", "Sept 9", "Sept 10", "Sept 11", "Sept 12", "Sept 13", "Sept 14", "Sept 15", "Sept 16", "Sept 17", "Sept 18", "Sept 19", "Sept 20", "Sept 21", "Sept 22", "Sept 23", "Sept 24", "Sept 25", "Sept 26", "Sept 27", "Sept 28", "Sept 29", "Sept 30", "Oct 01", "Oct 02", "Oct 03", "Oct 04", "Oct 05", "Oct 06", "Oct 07", "Oct 08", "Oct 09", "Oct 10"];

	$("#timeline").dateRangeSlider({
		bounds: {min: new Date(2014, 8, 1), max: new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate() + 2)},
		defaultValues: {min: new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate() - 1), max: new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate() + 1)},
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

    // load active jobs on button click
    $('#getArchives').click(function(){
	    getActiveJobs();
    });

	// Modal controls
	$(document).on("keyup", function (e) {
		var code = e.keyCode || e.which; if (code == 27) {
			clearModal();
		}
	});

	$('.close-modal').click(function(){
		clearModal();
	});
	
	// Search box
	var searchValue;
	var newSearchValue;
	$('header input.search').on("keydown", function (e) {
		searchValue = $('header input.search').val();
	});
	$('header input.search').on("keyup", function (e) {
		newSearchValue = $('header input.search').val();
		var code = e.keyCode || e.which; if (code == 32) {
			console.log('cannot search for empty space');
			return;
		} else if ( (newSearchValue != searchValue) && (newSearchValue != '') ) {
			if (searchRunning == 1) {
				clearTimeout ( searchTimerId );
				return;
			}
			searchRunning = 1;
			setTimeout ( 'runSearch()', 4000 );
		} else {
			console.log('Search value not changed or is null');
		}
	});
});
// Searching ...
var searchTimerId = 0;
var searchRunning;
function runSearch() {
	if($('#tweetListView').css('display') == 'block') {
		clearModal();
	}
	var searchTerm = $('.search').val();
	getActiveJobs(searchTerm);
	clearTimeout ( searchTimerId );
	searchRunning = 0;
}
// function to get active jobs JSON object
function getActiveJobs(searchTerm) {
	resetArchiveList = false;
	if (!searchTerm) {
		var searchTerm = '';
	}
    $('#intro').remove();
	$('.search').attr('disabled','disabled');
	$('#archiveListView').hide();
	$('#wait').fadeIn(100);	
	$.ajax({
		type: "GET",
		url: "http://blue.a.blocktech.com:3000/alexandria/v1/twitter/get/activejobs",
		success: function (responseData) {
			console.log('running search ... ' + searchTerm);
			$("#archiveList li").remove();
			var data = $.parseJSON(responseData);
//			console.log(data['Jobs']);
			for (var i = 0; i < data['Jobs'].length; i++) {
				if(!searchTerm){			
					$("#archiveList").append('<li id="archive-'+data['Jobs'][i].replace(/ /g,"-")+'"><a href="#" onclick="showTweetList($(this))"><span>' + data['Jobs'][i] + '</span> <span class="archive-volume"></span></a></li>');
					getArchiveVolume(data['Jobs'][i]);
				} else {
					var titleSlice = data['Jobs'][i].slice(0,searchTerm.length);
					if(titleSlice.toLowerCase() == searchTerm.toLowerCase()) {
						$("#archiveList").append('<li id="archive-'+data['Jobs'][i].replace(/ /g,"-")+'"><a href="#" onclick="showTweetList($(this))"><span>' + data['Jobs'][i] + '</span> <span class="archive-volume"></span></a></li>');
						getArchiveVolume(data['Jobs'][i]);
					}
				}
			}
			$('#archiveList li').sortElements(function(a, b){
				return $(a).text() > $(b).text() ? 1 : -1;
			});
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			// alert("some error");
			console.log(XMLHttpRequest);
			console.log(textStatus);
			console.log(errorThrown);
			$("#archiveList li").remove();
			$('header input.search').attr('disabled','disabled').css({background:'none #efefef',padding:'3px 15px'}).val('Cannot connect to Librarian');
	   }
	});
	
}
var resetArchiveList = false;
// show tweets in archive
function showTweetList(arch){
	var archiveTitle = arch;
	if($('#tweetListView').css('display') != 'block') {
		var searchValue = $('header input.search').val();
		archiveTitle = $(arch).find('span:first-child').text();
		if (searchValue != archiveTitle) {
			$('header input.search').val(archiveTitle);
			resetArchiveList = true;
		}
		$('.overlay').fadeIn(100);
	}
	getArchive(archiveTitle);
	if($('#resort').text() == 'Popular') {
		$('#tweetListView').addClass('pop-sort');
	}
}
// get archived tweets JSON object
function getArchive(archiveTitle) {
	// Loading spinner
	$('#wait').fadeIn(100);
	$("#tweetList li.responseRow").remove();
	// Run query
    $.ajax({
        type: "POST",
        url: "http://blue.a.blocktech.com:3000/alexandria/v1/twitter/get/archive",
        data: archiveTitle,
        success: function (e) {
			var data = $.parseJSON(e);
			var dateValues = $("#timeline").dateRangeSlider("values");
			for (var i = 0; i < data.length; i++) {
				var tweetDate = Date.parse(data[i].p.twitter.data[4]);
				if ( (tweetDate > Date.parse(dateValues.min) ) && ( tweetDate < Date.parse(dateValues.max) ) ){
					var niceTweetDate = data[i].p.twitter.data[4].split(' ');
					$("#tweetList").append('<li class="responseRow" tweetdate="'+tweetDate+'" retweets="'+data[i].p.twitter.data[7]+'"><div><strong><a href="https://twitter.com/'+data[i].p.twitter.data[9]+'" target="_blank" class="twitter-username">@' + data[i].p.twitter.data[9] + '</a></strong> <span class="tweet-date">' + niceTweetDate[0] + ' ' + niceTweetDate[1] + ' ' + niceTweetDate[2] + ' ' + niceTweetDate[5] + ' ' + niceTweetDate[3] + '</span></div><div class="tweetBody">' + data[i].p.twitter.data[10] + '</div><div style="clear:both"></div><div class="left"><span class="rts">Retweets: '+data[i].p.twitter.data[7]+'</span> <span class="favs">Favorites: '+data[i].p.twitter.data[6]+'</span></div><a class="twitterbird" href="https://twitter.com/'+data[i].p.twitter.data[9]+'/status/'+data[i].p.twitter.data[3]+'" target="_blank"></a></li>');
				}
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
		$('#wait').fadeOut(100);
        }
    });
}
// get archive volume
var spinnerCount = 0;
var cloudlist = [];
function getArchiveVolume(archiveTitle) {
	if(spinnerCount == 0) {
		$('#archiveListView').hide();
		$('#wait').fadeIn(100);
	}
	$('#archiveList li#archive-'+ archiveTitle.replace(/ /g,"-") +' span.archive-volume').append('<div id="loading-'+ archiveTitle.replace(/ /g,"-") +'" class="loader"></div>');
	spinnerCount++;
	var dateValues = $("#timeline").dateRangeSlider("values");
	$.ajax({
		type: "POST",
		url: "http://blue.a.blocktech.com:3000/alexandria/v1/twitter/get/archive/betweenDates/count",
		data: {
				"Archive": archiveTitle,
				"StartDate": Date.parse(dateValues.min),
				"EndDate": Date.parse(dateValues.max)
		},
		success: function (e) {
			var data = $.parseJSON(e);
			var archiveCount = 0;
			console.log('Archive = '+archiveTitle);
			console.log('StartDate = '+Date.parse(dateValues.min));
			console.log('EndDate = '+Date.parse(dateValues.max));
			console.log('Data = '+data);
			console.log('***');
			for (var i = 0; i < data.length; i++) {
				console.log(data[i].p.twitter.data[0]);
				var tweetDate = Date.parse(data[i].p.twitter.data[4]);
				if ( (tweetDate > Date.parse(dateValues.min) ) && ( tweetDate < Date.parse(dateValues.max) ) ) {
					archiveCount++;
				}
			}
			spinnerCount--;
			console.log('Archives to count = '+spinnerCount);
			if (data==0) {
				$('#archiveList li#archive-'+ archiveTitle.replace(/ /g,"-")).remove();				
			} else {
				$('#archiveList li#archive-'+ archiveTitle.replace(/ /g,"-") +' span.archive-volume').html(archiveCount);
				$('#archiveList li').each(function(){
					cloudlist.push([$(this).find('span:first-child').text(),archiveCount]);
				});
			}
			if(spinnerCount == 0) {
//				WordCloud(document.getElementById('wordCloud'), { list:cloudlist, minSize:'24px', backgroundColor:'transparent' } );
//				$('#wordCloud').fadeIn();
				if($('#archiveListView li').length == 0) {
					$("#archiveList").append('<li id="no-results"><a href="javascript:void(0);"><span>No Archives</span></li>');					
				}
				$('#archiveListView').fadeIn();
				var newHeight = parseInt($('#archiveList').height())+100+'px';
				$('#archiveListView').css('height',newHeight);
				$('#wait').fadeOut(100);
				$('.search').attr('disabled',false);
//				console.log(cloudlist);
			}
/*
			var archiveCount = 0;
			for (var i = 0; i < data.length; i++) {
				var tweetDate = Date.parse(data[i].p.twitter.data[4]);
				if ( (tweetDate > Date.parse(dateValues.min) ) && ( tweetDate < Date.parse(dateValues.max) ) ) {
					archiveCount++;
				}
			}
			spinnerCount--;
			console.log(spinnerCount);
			if (archiveCount==0) {
				$('#archiveList li#archive-'+ archiveTitle.replace(/ /g,"-")).remove();				
			} else {
				$('#archiveList li#archive-'+ archiveTitle.replace(/ /g,"-") +' span.archive-volume').html(archiveCount);
				$('#archiveList li').each(function(){
					cloudlist.push([$(this).find('span:first-child').text(),archiveCount]);
				});
			}
			if(spinnerCount == 0) {
//				WordCloud(document.getElementById('wordCloud'), { list:cloudlist, minSize:'24px', backgroundColor:'transparent' } );
//				$('#wordCloud').fadeIn();
				if($('#archiveListView li').length == 0) {
					$("#archiveList").append('<li id="no-results"><a href="javascript:void(0);"><span>No Archives</span></li>');					
				}
				$('#archiveListView').fadeIn();
				var newHeight = parseInt($('#archiveList').height())+100+'px';
				$('#archiveListView').css('height',newHeight);
				$('#wait').fadeOut(100);
				$('.search').attr('disabled',false);
				console.log(cloudlist);
			}
*/		}
	});
}
// scan archives after timeline slider values change
$("#timeline").bind("valuesChanged", function(e, data){
	var searchTerm = $('header input.search').val();
	if($('#tweetListView').css('display') == 'block') {
		$('ul#tweetList li').remove();
		showTweetList(searchTerm);
		resetArchiveList = true;
	} else {
		getActiveJobs(searchTerm);
	}
});
function clearModal() {
	$('.overlay').fadeOut(100);
	$("#tweetList li.responseRow").remove();
	if (resetArchiveList == true) {
		getActiveJobs($('header input.search').val());
	}
}

// sort order function
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