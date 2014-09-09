jQuery(document).ready(function($){
	
	$('header').append('<div id="resort" style="position: absolute;right: 1em;top: 50%;margin-top: -.5em;line-height: 1;cursor:pointer">Recent</div>');
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
	Date.prototype.today = function () { 
		return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
	}

	// For the time now
	Date.prototype.timeNow = function () {
		 return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
	}
	Date.prototype.timeNow = function(){
		return ((this.getHours() < 10)?"0":"") + ((this.getHours()>12)?(this.getHours()-12):this.getHours()) +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds() + ((this.getHours()>12)?('PM'):'AM');
	};
	var datetime = new Date();
	// Footer timeline contruct
	var days = ["0", "Sept 1", "Sept 2", "Sept 3", "Sept 4", "Sept 5", "Sept 6", "Sept 7", "Sept 8", "Sept 9", "Sept 10", "Sept 11"];

	$("#timeline").dateRangeSlider({
		bounds: {min: new Date(2014, 8, 1), max: new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate() + 2)},
		defaultValues: {min: new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate() - 5), max: new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate())},
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

/*	var largeSpinConfig = {
		lines: 13, // The number of lines to draw
		length: 20, // The length of each line
		width: 10, // The line thickness
		radius: 30, // The radius of the inner circle
		corners: 1, // Corner roundness (0..1)
		rotate: 0, // The rotation offset
		direction: 1, // 1: clockwise, -1: counterclockwise
		color: '#000', // #rgb or #rrggbb or array of colors
		speed: 1, // Rounds per second
		trail: 400, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: '50%', // Top position relative to parent
		left: '50%' // Left position relative to parent
	};
	var target = document.getElementById('wait');
	var spinner = new Spinner(largeSpinConfig).spin(target);
*/

    // load active jobs on pageload
    getActiveJobs();

	// Modal controls
	$(document).on("keyup", function (e) {
		var code = e.keyCode || e.which; if (code == 27) {
			clearModal();
			$('header input.search').val('');
			getActiveJobs();
		}
	});

	$('.close-modal').click(function(){
		clearModal();
		$('header input.search').val('');
		getActiveJobs();
	});
	
	// Search box
	$('header input.search').on("keyup", function (e) {
		if($('#tweetListView').css('display') == 'block') {
			clearModal();
		}
		var searchTerm = $(this).val();
		getActiveJobs(searchTerm);
	});
});
// function to get active jobs JSON object
function getActiveJobs(searchTerm) {
	$.ajax({
		type: "GET",
		url: "http://blue.a.blocktech.com:3000/alexandria/v1/twitter/get/activejobs",
		success: function (responseData) {
			$("#archiveList li").remove();
			var data = $.parseJSON(responseData);
			for (var i = 0; i < data.length; i++) {
				if(!searchTerm){					
					$("#archiveList").append('<li id="archive-'+data[i].replace(/ /g,"-")+'"><a href="#" onclick="showTweetList($(this))"><span>' + data[i] + '</span> <span class="archive-volume"><img src="img/loaderb16.gif" /></span></a></li>');
					getArchiveVolume(data[i]);
				} else {
					var titleSlice = data[i].slice(0,searchTerm.length);
					if(titleSlice.toLowerCase() == searchTerm.toLowerCase()) {
						$("#archiveList").append('<li id="archive-'+data[i].replace(/ /g,"-")+'"><a href="#" onclick="showTweetList($(this))"><span>' + data[i] + '</span> <span class="archive-volume"><img src="img/loaderb16.gif" /></span></a></li>');
						getArchiveVolume(data[i]);
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
// show tweets in archive
function showTweetList(arch){
	var archiveTitle = $(arch).find('span:first-child').text();
	$('header input.search').val(archiveTitle);
	getArchive(archiveTitle);
	if($('#resort').text() == 'Popular') {
		$('#tweetListView').addClass('pop-sort');
	}
	$('#tweetListView').fadeIn(500);
}
// get archived tweets JSON object
function getArchive(archiveTitle) {
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
					$("#tweetList").append('<li class="responseRow" tweetdate="'+tweetDate+'" retweets="'+data[i].p.twitter.data[7]+'"><div><strong>@' + data[i].p.twitter.data[9] + '</strong> <span class="tweet-date">' + data[i].p.twitter.data[4] + '</span></div> <div>' + data[i].p.twitter.data[10] + '</div></li>');
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
        }
    });
}
// get archive volume
function getArchiveVolume(archiveTitle) {
	$.ajax({
		type: "POST",
		url: "http://blue.a.blocktech.com:3000/alexandria/v1/twitter/get/archive",
		data: archiveTitle,
		success: function (e) {
			var data = $.parseJSON(e);
			var archiveCount = 0;
			var dateValues = $("#timeline").dateRangeSlider("values");
			for (var i = 0; i < data.length; i++) {
				var tweetDate = Date.parse(data[i].p.twitter.data[4]);
				if ( (tweetDate > Date.parse(dateValues.min) ) && ( tweetDate < Date.parse(dateValues.max) ) ){
					archiveCount++;
				}
			}
			$('#archiveList li#archive-'+ archiveTitle.replace(/ /g,"-") +' span.archive-volume').html(archiveCount);
		}
	});
}
// scan archives after timeline slider values change
$("#timeline").bind("valuesChanged", function(e, data){
	if($('#tweetListView').css('display') == 'block') {
		clearModal();
	}
	var searchTerm = $('header input.search').val();
	getActiveJobs(searchTerm);
});
function clearModal() {
	$('#tweetListView').fadeOut(500);
	$("#tweetList li.responseRow").remove();
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
