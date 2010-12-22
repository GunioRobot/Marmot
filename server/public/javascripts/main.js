if (typeof main == 'undefined') { main = {}; }

(function($) {
  var app = $.sammy(function() {
    
    this.element_selector = "#artist_info";
        
    this.get('#/show/:artist_id', function(context){
      context.app.swap('');
      var artist_name = this.params['artist_id'];
      this.load('/artists/'+artist_name).then(function(data){
        context.$element().html(data);
        main.artistListWatcher();
      }).then(function(data){
        this.load('/videos/'+artist_name).then(function(data){
          $('#artist_videos').html(data);
        });
      });
    });
    
  });

  $(function() {
    app.run();
  });
  
})(jQuery);       



$(document).ready(function() {
  main.artistListWatcher();
  main.artistSearch();
});

main.artistListWatcher = function(){
  var current_time = new Date(); 
  var two_hours_from_now = new Date(current_time.setTime(current_time.getTime()+(3600 * 1000)));
  var last_updated = new Date(localStorage["artists.last_updated"]);
  var diff = (two_hours_from_now.getTime()-last_updated.getTime())/(1000*60*60);
  var result = Math.round(diff*Math.pow(10,2))/Math.pow(10,2);
  
  if(result >= 2.0){
    var artists = [];
    for (var i = $('.artist_listing').length - 1; i >= 0; i--){
      var e = $('.artist_listing')[i];
      var artist_name = $(e).text();
      var artist_link = $(e).attr('href');
      artists.push({
        name: artist_name,
        url: artist_link
      });
    };

    localStorage["artists.all"] = JSON.stringify(artists);
    localStorage["artists.last_updated"] = new Date();
  }else{
    
    var artists = JSON.parse(localStorage['artists.all']);
    $.each(artists, function(index, artist){
      console.log(artist.name + " || " + artist.url);
    });
    
    console.log("No need to update the artist search list because result is: " + result);
  }
  
  
};
   

main.artistSearch = function(){
};

