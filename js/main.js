var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
  $("#timeline").dateRangeSlider({
    bounds: {min: new Date(2020, 0, 1), max: new Date(2020, 11, 31, 20, 59, 59)},
    defaultValues: {min: new Date(2020, 7, 15), max: new Date(2020, 20, 31)},
    valueLabels: "change",
    arrows:false,
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
  
  var largeSpinConfig = {
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
  
  var cloudlist = [['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 20], ['bar', 40],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],['foo', 80], ['bar', 100],] 
  
   WordCloud(document.getElementById('wordCloud'), { list:cloudlist } );