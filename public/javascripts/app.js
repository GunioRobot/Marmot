// Define the namespace...
if (typeof app == 'undefined') { app = {}; }

// Define the app.ajax namespace. All ajax methods go in here.
app.ajax = {};


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
    var url = $(this).attr('href');
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

$(document).ready(function() {
  // Sets up click events on the artists name using .ajax_link in the sidebar, and fills in the data in the #artist_info element
  app.ajax.Link('.ajax_link', '#artist_info');
});
