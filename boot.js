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
  var CouchClient = require('couch-client');
  var Songs = CouchClient("http://localhost:5984/artist_development");

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
      Songs.view('/artist_development/_design/Artist/_view/by_albums', {key: req.params.id, include_docs: true, limit:1}, function(err, doc) {
        var artist = doc.rows[0].doc;
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
      Songs.get(req.params.id, function(err, doc){
        res.sendfile(doc.file_path);
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

// App helpers
  app.helpers({
    
    // Returns the square thumbnail image for an album. Pass in an Artist couchdb object
    squareAlbumImage: function(artist){ return artist.artist_images[2].image_url;},
    
    // link helpers
    artistLink: function(song){ return ("/artists#"+escape(song.key));}
    
    
  });


app.listen(8080);