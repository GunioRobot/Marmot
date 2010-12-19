/*
  Helpful links:
  EJS: http://embeddedjs.com/getting_started.html
  Express: http://expressjs.com/guide.html
  CouchClient: https://github.com/creationix/couch-client
  CouchDB: http://wiki.apache.org/couchdb/
*/

// Load config file. Once eval'd, the YOUTUBE object is available
// Currently handles YOUTUBE.client_key and YOUTUBE.dev_key
var fs = require('fs');
eval(fs.readFileSync('config.js').toString());


// Requires
  var express = require('express'); 
  var sys = require("sys");   
  var connect = require('connect');
  
  var _ = require('underscore');
  var CouchClient = require('couch-client');
  
  var Songs = CouchClient("http://localhost:5984/artist_development");

	// require the user model
	var user = require('./lib/user')();
  
  var YouTube = require('./lib/youtube');
  var youtube = YouTube(YOUTUBE.client_key, YOUTUBE.dev_key);
  
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
    
    app.use(express.cookieDecoder());
    app.use(express.session());
        
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
    Songs.view('/artist_development/_design/Artist/_view/by_slug', {key: req.params.id}, function(err,doc){
      var artist = doc;
      youtube.searchForVideo(escape(artist.name), function(videos){
        res.render('videos', {
           locals: {videos: videos},
           layout: false
        });      
      });
    });  
  });
  
  app.get('/register', function(req, res){
    res.render('register.ejs', {
      locals: {req: req}
    });
  });

app.post('/register', function(req,res){
  user.create(AUTH, req, function(user){
		res.redirect('/register');
	});
});

// App helpers
  app.helpers({
    
    // Returns the square thumbnail image for an album. Pass in an Artist couchdb object
    squareAlbumImage: function(artist){ return artist.artist_images[2].image_url;},
    
    // link helpers
    artistLink: function(song){ return ("/artists#"+escape(song.key));},
    
    // helper for some page elements to be shown or hidden. 
    // TODO - Always returning true for now, but in the future make this work for real. 
    isLoggedIn: function(req) { return true; }
  });


app.listen(8080);   