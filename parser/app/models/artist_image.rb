class ArtistImage < CouchRestRails::Document

	# Tell CouchDB to use the artist database
	use_database :artist

	property :image_size
	property :image_url
	property :width
	property :height

	timestamps!

end