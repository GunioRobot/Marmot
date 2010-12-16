/*
  Helpful links:
  EJS: http://embeddedjs.com/getting_started.html
  Express: http://expressjs.com/guide.html
  CouchClient: https://github.com/creationix/couch-client
  CouchDB: http://wiki.apache.org/couchdb/
*/

// Requires
  var express = require('express'); 
  var sys = require("sys");   
  var connect = require('connect');
  var _ = require('underscore');
  var xml = require('./lib/node-xml');
  var http = require('http');
  var fs = require('fs');
  var CouchClient = require('couch-client');
  var Songs = CouchClient("http://localhost:5984/artist_development");
  
  // Load config file. Once eval'd, the YOUTUBE object is available
  // Currently handles YOUTUBE.client_key and YOUTUBE.dev_key
  eval(fs.readFileSync('config.js').toString());
  
  // Create the Express app.
  var app = express.createServer();

// Configure the app here
  app.configure(function(){
    app.use(connect.logger()); // For some reason, the logger has to be first... 
    app.use(express.methodOverride());
    app.use(express.bodyDecoder());
    app.use(app.router);
    app.use(express.staticProvider(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.set('views');
    app.set('view engine','ejs');      
  });         
                    
// Resource function
  app.resource = function(path, obj) {
    this.get(path, obj.index);
    this.get(path + '/:a..:b.:format?', function(req, res){
      var a = parseInt(req.params.a, 10)
        , b = parseInt(req.params.b, 10)
        , format = req.params.format;
      obj.range(req, res, a, b, format);
    });
    this.get(path + '/:id', obj.show);
    this.del(path + '/:id', obj.destroy);
  };   


// Artist resource, and object to be passed into app.resource()
  var Artist = { 
  
    // GET => /artists
    index: function(req, res){
      Songs.view('/artist_development/_design/Artist/_view/all', {}, function(err, doc) {
        res.render('index.ejs', {
          locals: {songs: doc.rows}
        });
      }); 
    },
  
    // GET => /artists/:id
    show: function(req, res){ 
      // TODO - Fix this view because I accidently deleted the couchdb function... in couch... when I deleted the DB. #fail
      Songs.view('/artist_development/'+req.params.id, {}, function(err, doc) {
        var artist = doc;
        var songs = [];
        var sorted_albums = _.sortBy(artist.albums, function(album){ return album.name;});
        for(var i=0; i < sorted_albums.length; i++){
          var album = sorted_albums[i];
          var sorted_songs = _.sortBy(album.songs, function(song){ return song.track_number;});
          for(var j=0; j < sorted_songs.length; j++){
            var song = sorted_songs[j];
            songs.push({song: song, album: album});
          };
        };

        res.render('artist_show', {
           locals: {artist: artist, songs: songs},
           layout: false
        });
        
      });   
    }
    

  };
  

// Play resource, and object to be passed into app.resource()
  var Play = {
        
    // GET => /play/:song_slug
    show: function(req, res){
      Songs.view('/artist_development/'+req.params.id, {}, function(err, doc){
        var song = doc;
        res.sendfile(song.file_path);
      });
    }
    
  };

// Resources
  app.resource("/artists", Artist);  
  app.resource("/play", Play);

// Root url that redirects to /artists
  app.get('/', function(req, res){
    res.redirect('/artists');
  });
           
// GET - Returns videos from Youtube for a given artist (:id). Pass in the regular artist name so there's no reason to connect to couch based off the artist slug to get the real name. 
  app.get('/videos/:id', function(req,res){  
    var artist_name = escape(req.params.id);
    var connection = http.createClient(80, "gdata.youtube.com");
    var url = "/feeds/api/videos?v=2&alt=jsonc&q="+artist_name+"&category=Music&format=5&orderby=relevance&safesearch=none"; 
    var request = connection.request('GET', url, {
          "host": "gdata.youtube.com", 
          "X-GData-Client": YOUTUBE.client_key,
          "X-GData-Key": "key="+YOUTUBE.dev_key
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
        res.render('videos', {
           locals: {videos: videos},
           layout: false
        });
      });

    });
  });
  
  // Extracts videos based off the json_chunk.
  // Returns a hash with the following structure:
  /*
    {title: "The video title",
     thumbnail: "http://someurl.com/to/an/image.jpg",
     url: "http://theurl.com/to/youtubes/video/page"}
  */
  var extractVideos = function(json_chunk){
    var videos = [];
    var json = JSON.parse(json_chunk);
    for (var i=0; i < json.data.items.length; i++) {
      try{
        var item = json.data.items[i];
        if(item.title && item.title && item.thumbnail.sqDefault){
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

// App helpers
  app.helpers({
    
    // Returns the square thumbnail image for an album. Pass in an Artist couchdb object
    squareAlbumImage: function(artist){ return artist.artist_images[2].image_url;},
    
    // link helpers
    artistLink: function(song){ return ("/artists#"+escape(song.key));}
  });


app.listen(8080);