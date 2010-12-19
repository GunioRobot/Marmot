# == Base class for query last.fm for artist, album and song data

require File.join(File.dirname(__FILE__), 'lib', 'last_fm_connection')
require File.join(File.dirname(__FILE__), 'lib', 'last_fm_album') 
require File.join(File.dirname(__FILE__), 'lib', 'last_fm_artist_info') 
require File.join(File.dirname(__FILE__), 'lib', 'last_fm_artist_image')
require File.join(File.dirname(__FILE__), 'lib', 'last_fm_similar_artist')