/*
  Useage:
  
  var YouTube = require('./lib/youtube');
  var youtube = YouTube(YOUTUBE.client_key, YOUTUBE.dev_key);
  youtube.searchForVideo('Junip', function(videos){
    ... 
  });
  
*/

var http = require('http');
var fs = require('fs');

function Youtube(client_key, dev_key) {
  
  /* 
    Pass in an artist name. The callback will be returned with a json object of videos:
      {title: "Title of the video",
       thumbnail: "http://thumbnailofvideo.png",
       url: "http://youtube.com/video_url"}
  */
  function searchForVideo(artist_name, callback){
    var url = "/feeds/api/videos?v=2&alt=jsonc&q="+artist_name+"&category=Music&format=5&orderby=relevance&safesearch=none";
    var connection = http.createClient(80, "gdata.youtube.com");
    var request = connection.request('GET', url, {
          "host": "gdata.youtube.com", 
          "X-GData-Client": client_key,
          "X-GData-Key": "key="+dev_key
        });   
    request.end();  
    request.on('response', function (response) {
      var bodyData = "";
      response.setEncoding('utf8');  
      response.on('data', function (chunk) { 
        bodyData += chunk;
      });
      response.on('end', function(data){
        
        // Extract some attributes
        videos = extractVideosFromJson(bodyData);
        callback(videos); // return the videos in the callback
      });
    });    
  };
  
  function extractVideosFromJson(json_chunk) {
    var videos = [];
    var json = JSON.parse(json_chunk);
    for (var i=0; i < json.data.items.length; i++) {
      try{
        var item = json.data.items[i];
        if(item.title && item.player['default'] && item.thumbnail.sqDefault){
          videos.push({
            title: item.title,
            thumbnail: item.thumbnail.sqDefault,
            url: item.player['default']  // .default was throwing JSlint errors so I opted for this syntax ['default']
          });
        }
      }catch(err){
        console.log("Error parsing youtube JSON");
        console.log(err);
        console.log("----------------------");
      };
    };
    return videos;
  };  
  
  // Exposes the API.
  return {
    searchForVideo: searchForVideo
  };
  
};

module.exports = Youtube;