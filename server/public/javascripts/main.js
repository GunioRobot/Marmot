(function($) {
  var app = $.sammy(function() {
    
    this.element_selector = "#artist_info";
        
    this.get('#/show/:artist_id', function(context){
      context.app.swap('');
      var artist_name = this.params['artist_id'];
      this.load('/artists/'+artist_name).then(function(data){
        context.$element().html(data);
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

