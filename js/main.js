jQuery(document).ready(function($){
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
	$("#timeline").dateRangeSlider({
		bounds: {min: new Date(2014, 0, 1), max: new Date(2014, 11, 31, 20, 59, 59)},
		defaultValues: {min: new Date(2014, 7, 15), max: new Date(2014, 20, 31)},
	//    valueLabels: "change",
		arrows: false,
		scales: [{
		  first: function(value){ return value; },
		  end: function(value) {return value; },
		  next: function(value){
			var next = new Date(value);
			return new Date(next.setMonth(value.getMonth() + 1));
		  },
		  label: function(value){
			return months[value.getMonth()];
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

/*  
  var cloudlist = [['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],];
  WordCloud(document.getElementById('wordCloud'), { list:cloudlist } );
*/

    // function to get active jobs JSON object
    function getActiveJobs() {

        $.ajax({
            type: "GET",
            url: "http://blue.a.blocktech.com:4000/test/getArchivedTweets",
            success: function (responseData) {

                // respond with this alert (data passed back is responseData)
               
                var data = $.parseJSON(responseData);

                console.log(data);

                for (var i = 0; i < data.length; i++) {
                    $("#tweetList").append('<li class = "responseRow"><div><strong>@' + data[i].p.twitter.data[6] + '</strong> <span class="tweet-date">' + data[i].p.twitter.data[1] + '</span></div> <div>' + data[i].p.twitter.data[7] + '</div></li>');
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("some error");
                console.log(XMLHttpRequest);
                console.log(textStatus);
                console.log(errorThrown);
                $("#tweetList").append("<li class = 'responseRow'>Cannot connect to Librarian</li>");
           }
        });

    }

	$('#archiveList a').click(function(){
		// load active jobs
		var archiveTitle = $(this).find('span:first-child').text();
		$('header input[type="search"]').attr('value',archiveTitle);
		getActiveJobs();
		$('#tweetListView').fadeIn(100);
	});

	$(document).on("keyup", function (e) {
		var code = e.keyCode || e.which; if (code == 27) {
			clearModal();
		}
	});

	$('.close-modal').click(function(){
		clearModal();
	});

	function clearModal() {
		$('#tweetListView').fadeOut(100);
		$('header input[type="search"]').attr('value','');
		$("#tweetList li.responseRow").remove();
	}
});
