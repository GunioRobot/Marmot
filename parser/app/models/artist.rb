# The Artist class inherits from <tt>CouchRestRails::Document</tt>.
#
# ==== What is an Artist?
# At the highest level, an artist is just a name. An artist has many albums and an artist has many songs. There is a relationship
# between albums and songs, but please see the Album and Song class to learn more about them.
#
# ---
# ==== How to use this class
#
# To find an artist by name:
#   Artist.by_name(:name => 'Tool').first
#
# To create an artist, a related album and some songs.
#   pink_floyd = Artist.new({:name => "Pink Floyd", :about_short => "", :about_long => "", :albums => [], :artist_images => []})
#   pink_floyd.albums << Album.create({:name => "The Wall", :summary => "The Wall is pretty sweet", :songs => []})
#   pink_floyd.albums.first.songs << Song.create({:name => "In the flesh?", :track_number => "1"})
#   pink_floyd.albums.first.songs << Song.create({:name => "The thin ice", :track_number => "2"})
#   pink_floyd.albums.first.songs << Song.create({:name => "Another Brick in the Wall Pt 1", :track_number => "3"})
#   pink_floyd.save
#   pink_floyd.get_external_artist_info({:artist_info => true, :artist_images => true})
#
# The code above will create a couchdb json structure like so:
# {
#    "_id": "pink-floyd",
#    "_rev": "7-a58e7ed62462437694bc0376b0459067",
#    "slug": "pink-floyd",
#    "name": "Pink Floyd",
#    "updated_at": "2010/03/04 21:17:15 +0000",
#    "about_short": "Awesome",
#    "albums": [
#        {
#            "name": "The Wall",
#            "updated_at": "2010/03/04 21:16:52 +0000",
#            "songs": [
#                {
#                    "name": "In the flesh?",
#                    "track_number": "1",
#                    "updated_at": "2010/03/04 21:16:34 +0000",
#                    "_rev": "1-e4833531dc378bb2e58f27d184204e2b",
#                    "_id": "035f37c804ece62cf36cf8bb99df0317",
#                    "couchrest-type": "Song",
#                    "created_at": "2010/03/04 21:16:34 +0000"
#                },
#                {
#                    "name": "The thin ice",
#                    "track_number": "2",
#                    "updated_at": "2010/03/04 21:16:44 +0000",
#                    "_rev": "1-d434d1aeeebebbd750c6116283d45fb3",
#                    "_id": "5d89efd7125d5f8af7ddc17fc5453982",
#                    "couchrest-type": "Song",
#                    "created_at": "2010/03/04 21:16:44 +0000"
#                },
#                {
#                    "name": "Another Brick in the Wall Pt 1",
#                    "track_number": "3",
#                    "updated_at": "2010/03/04 21:16:50 +0000",
#                    "_rev": "1-e8938759a8ba9080ae482e2072341d96",
#                    "_id": "cc0aaf4673e70a3842f86d4f78e22c16",
#                    "couchrest-type": "Song",
#                    "created_at": "2010/03/04 21:16:50 +0000"
#                }
#            ],
#            "_rev": "2-c0249bec77986a7988fe8d5451753f56",
#            "_id": "3d54b25ec78fd0162e68c6d2ab866505",
#            "summary": "The Wall is pretty sweet",
#            "couchrest-type": "Album",
#            "created_at": "2010/03/04 21:15:34 +0000"
#        }
#    ],
#    "about_long": "Pink Floyd is fucking awesome",
#    "couchrest-type": "Artist",
#    "created_at": "2010/03/04 21:10:41 +0000"
# }
#
# ==== Validations
# * <tt>name</tt> (validates presence of)
#
# ==== Callbacks
# * generate_slug_from_title Generates a slug from the artist's name
#

class Artist < CouchRestRails::Document

	# A module that consists of common callbacks for the Artist, Album and Song classes
	include CouchDbCallbacks

	# The LastFm module is responsible for collecting data from last.fm's web services. http://www.last.fm/api
	# include LastFm

	# Tell CouchDB to use the artist database
  use_database :artist

	# The ID will be the band name in sanitized slug form
	unique_id :slug

	# The properties (attributes) that describe an Artist
  property :name
  property :about_short
  property :about_long
	property :slug, :read_only => true
	property :albums, :cast_as => ['Album']
	property :artist_images, :cast_as => ['ArtistImage']
  timestamps!

	# CouchDB views
  view_by :name, :descending => true
	view_by :slug, :descending => true

	view_by :albums,
					:map => "
function(doc) {
	if(doc['albums']){
		emit(doc['name'], doc['albums']);
	}
}"

	# Validations
  validates_presence_of :name

	# Callbacks
	set_callback :save, :before, :generate_slug_from_name

	class << self

		# Returns either a new artist, or an artist already in CouchDB
		# Options are:
		#
		# * <tt>:name</tt> - The name of the artist
		# * <tt>:pull_metadata</tt> - Connects to last.fm and pulls the metadata. Default is "true". Pass in :pull_metadata => false to disable.
		#
		# If the artist can't be found, a new one will be created and a call to last.fm for artist info is performed.
		def find_or_create_artist(opts={})

			pull_metadata = opts[:pull_metadata].nil? ? true : opts[:pull_metadata]

			artist = Artist.by_name({:key => opts[:name]}).first
			if artist.nil?
				ar = Artist.create({
					:name => opts[:name],
					:about_short => "",
					:about_long => "",
					:albums => [],
					:artist_images => []
				})

				# Pull artist info from last.fm
				if pull_metadata == true
					ar.get_external_artist_info({:artist_info => true, :artist_images => true})
				end

				return ar
			else
				artist
			end
		end
	end


	# Returns the artist data from last.fm for 'self' artist based on name
	# Options are:
  #
  # * <tt>:artist_info</tt> - If set to 'true', artist info will be queried from last.fm.
	# * <tt>:artist_images</tt> - If set to 'true', artist images will be queried from last.fm.
	# * <tt>:similar_artists</tt> - If set to 'true', similar artists will be queried from last.fm.
	#
	# TODO = get_external_artist_info needs to be refactored. Everything is lumped together to see exactly what needs refactoring in the future. A pattern should evolve sooner or later.
	def get_external_artist_info(opts={})

		# Get the artist's info if opts[:artist_info] == true
		if opts[:artist_info] == true
			artist_info = LastFm::LastFmArtistInfo.new(:artist_name => self.name)
			self['about_short'] = artist_info.summary
			self['about_long'] = artist_info.content
			self.save
		end

		# Get the artist's images if opts[:artist_images] == true
		if opts[:artist_images] == true
			artist_images = LastFm::LastFmArtistImage.new(:artist_name => self.name)

			self.artist_image_sizes.each do |size|
				begin
					self.artist_images << ArtistImage.create({
						:image_url => artist_images.image(size),
						:image_size => size,
						:width => artist_images.width(size),
						:height => artist_images.height(size)
					})
					self.save
				rescue Exception => e
					next
				end
			end
		end

	end

	protected

	# Image size names specific to last.fm's naming convention.
	#
	# TODO = Do not like hardcoding the image sizes. Figure out a better way!
	def artist_image_sizes
		%w{ original large largesquare medium small }
	end

end