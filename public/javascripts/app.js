// Define the namespace...
if (typeof app == 'undefined') { app = {}; }

// Define the app.ajax namespace. 
app.ajax = {};

// Define the app.player namespace.
app.player = {};

/*
  @description
    A somewhat generic ajax wrapper that takes a 'click_id' and an 'element_id'. Makes an ajax call using the click_id's 'href' param
    and fills in 'element_id' with the returned data.

  @args
    click_id = The element the click event should be attached to
    element_id = The element that received the data after the ajax call
*/
app.ajax.Link = function(click_id, element_id){
  $(click_id).click(function(event){   
    event.preventDefault();
    $(element_id).empty();
    var url = $(this).attr('rel');
    $.ajax({
      url: url,
      success: function(data) {
        $(element_id).html(data);
      },
      error: function(data) {
        $(element_id).html(data);
      }
    });
  }); 
};   

                   
/* All the functions for playing a track are in here. 
  
  Currently supports the following callbacks for HTML5 audio:
    * seeked - fires when a user is seeking through a track
    * ended - fires when the current track has ended
*/

app.player.Play = function(){
  var audio_element = $('#player')[0];
  var current_track;
  
  // an anonymous playSong method that takes an element. 
  // Also sets the current_track var to the element
  function playSong(element) { 
    current_track = $(element);
    audio_element.src = $(element).attr('href'); 
    audio_element.autoplay = true;
    audio_element.preload = 'auto';
  };
  
  // Attach the click event to each .play_song attribute (i.e a track);
  $('.play_song').live('click', function(event){
    event.preventDefault();    
    playSong(this);
  }); 
  
  // 'seeked' callback
  audio_element.addEventListener('seeked',function(){
    audio_element.play();
  });
  
  // 'ended' callback
  audio_element.addEventListener("ended", function(){
    var track_number = parseInt($(current_track).attr('rel'),10);
    var next_track = track_number + 1;       
    var next_track_element = $('.play_song[rel=' + next_track + ']');
    
    // Check to see if we have a next track to play...
    if($(next_track_element).length == 1){
      playSong(next_track_element);
    }else{
      // if we don't have another track to play, figure out what to do. 
    }
  });
       
};

$(document).ready(function() {
  // Sets up click events on the artists name using .ajax_link in the sidebar, and fills in the data in the #artist_info element
  app.ajax.Link('.ajax_link', '#artist_info');
  
  // Sets up the player on the artist's page
  app.player.Play();
});
