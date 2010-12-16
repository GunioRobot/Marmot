/* 
  Links:
  youtube json wizard: http://code.google.com/apis/youtube/articles/view_youtube_jsonc_responses.html
  
*/

var http = require('http');
var connection = http.createClient(80, "gdata.youtube.com");
var artist_name = "Junip";
var url = "/feeds/api/videos?v=2&alt=jsonc&q="+artist_name+"&category=Music&format=5&orderby=relevance&safesearch=none"; 
var request = connection.request('GET', url, {
      "host": "gdata.youtube.com", 
      "X-GData-Client": "ytapi-DaveHoefler-Hush-dlno96g0-0",
      "X-GData-Key": "key=AI39si4cZ8pe-oSkOrqJMpkwUzz95m7EcE-3hlq7TKkw5wKIeRXL2xtsFGEMTQd0tKZQDHZN645-z6DbQ-BXBeFeym3YEcjLyA"
    });   
    
request.end();
request.on('response', function (response) {
  response.setEncoding('utf8');  
  
  var bodyData = "";
  response.on('data', function (chunk) {
    bodyData += chunk;
  });
  
  response.on('end', function(data){
    videos = extractVideos(bodyData);
    console.log(videos);
  });
  
});


var extractVideos = function(json_chunk){
  var videos = [];
  var json = JSON.parse(json_chunk);
  for (var i=0; i < json.data.items.length; i++) {
    try{
      var item = json.data.items[i];
      if(item.title && item.title && item.thumbnail.sqDefault){
        var video = {};
        video.title = item.title;
        video.thumbnail = item.thumbnail.sqDefault;
        video.url = item.player.default;
        videos.push(video);
      }
    }catch(err){};
  };
  return videos;
};