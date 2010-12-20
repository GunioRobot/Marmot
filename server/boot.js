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
var YouTube = require('./lib/youtube');
var youtube = YouTube(YOUTUBE.client_key, YOUTUBE.dev_key);

var Auth = require('./lib/authentication');
var auth = Auth(AUTH.encryption_key, AUTH.iv);
var User = require('./lib/user');
var user = User(auth);

// Create the Express app.
var app = express.createServer();
app.use(express.bodyDecoder());
app.use(connect.logger()); // For some reason, the logger has to be first... 
app.use(express.cookieDecoder());
app.use(express.session());
app.use(app.router);
app.use(express.methodOverride());

app.use(express.staticProvider(__dirname + '/public'));
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));            
app.set('views');
app.set('view engine','ejs');      


// Checks to see if the user is logged in. If not, redirects them to /login;
function isLoggedIn(req, res, callback){
  user.exists(req.session.db_id, function(result){
    if(result == true){
      callback(result);
    }else{
      req.session.redirect_to = res.url;
      res.redirect('/login');
    };
  });  
};

// GET: Root path. Shows all the artists.
app.get('/', function(req, res){
  if(isLoggedIn(req, res, function(result){
    Songs.view('/artist_development/_design/Artist/_view/all', {}, function(err, doc) {
      res.render('index.ejs', {
        locals: {songs: doc.rows}
      });
    }); 
  }));    
});

// GET: Shows a particular artist based on the artist slug
app.get('/artists/:id', function(req,res){
  if(isLoggedIn(req, res, function(result){
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
  }));
}); 

// GET: Plays a song based on the given song slug
app.get('/play/:song_slug', function(req, res){
  if(isLoggedIn(req, res, function(result){
    Songs.view('/artist_development/'+req.params.song_slug, {}, function(err, doc){
      var song = doc;
      res.sendfile(song.file_path);
    });      
  }));
});
 
// GET: Gets a bunch of videos for the given :id (which is the artist slug)
app.get('/videos/:id', function(req,res){
  if(isLoggedIn(req, res, function(result){
    Songs.view('/artist_development/_design/Artist/_view/by_slug', {key: req.params.id}, function(err,doc){
      var artist = doc;
      youtube.searchForVideo(escape(artist.name), function(videos){
        res.render('videos', {
           locals: {videos: videos},
           layout: false
        });      
      });
    });    
  }));
});

// GET: Register
app.get('/register', function(req, res){
  res.render('register.ejs', {
    locals: {req: req}
  });
});

// POST: Save registration
// TODO: Add error handling
app.post('/register', function(req,res){  
  user.create(req, function(user){
    req.session.db_id = user.id;
		res.redirect('/');
	});
});

// GET: Shows the login page
app.get('/login', function(req,res){
  res.render('login.ejs');
});

// POST: Perform the login
// TODO: Add error handling
app.post('/login',function(req, res){
  user.login(req, function(user){
    if(user){       
      req.session.db_id = user.id;   
      res.redirect('/');
    }else{
      res.render('login.ejs');
    };
  });  
}); 

// GET: Logs someone out
// TODO: Finish this
app.get('/logout', function(req, res){
  
  res.redirect('/login');
});


// App helpers
app.helpers({
  
  // Returns the square thumbnail image for an album. Pass in an Artist couchdb object
  squareAlbumImage: function(artist){ return artist.artist_images[2].image_url;},
  
  // link helpers
  artistLink: function(song){ return ("/artists#"+escape(song.key));}
});


app.listen(8080);   