class Album < CouchRestRails::Document

	# Tell CouchDB to use the artist database
	use_database :artist

	property :name
	property :summary
	property :release_date
	property :album_image
	property :image_url
	property :release_date

	property :songs, :cast_as => ['Song']

	timestamps!

	validates_presence_of :name

	view_by :name, :descending => true

	def get_external_album_info(artist)
		begin
			album_info = LastFm::LastFmAlbum.new(:artist_name => artist.name, :album_name => self.name)
			self['album_image'] = album_info.image("extralarge")
			self['summary'] = album_info.summary
			self['release_date'] = album_info.release_date.nil? ? nil : album_info.release_date
			if self.save
				self
			else
				raise "Error saving album: #{self.inspect}"
			end
		rescue Exception => e
			puts "get_external_album_info: #{e.backtrace}"
		end
	end

	class << self
		def find_or_create_album(opts={})

			pull_metadata = opts[:pull_metadata].nil? ? true : opts[:pull_metadata]

			album = Album.by_name({:key => opts[:name]}).first

			puts "Album looks like: #{album.inspect}"

			if album.nil?
				al = Album.create({
					:name => opts[:name],
					:summary => "",
					:release_date => "",
					:album_image => "",
					:songs => []
				})

				if pull_metadata == true
					al.get_external_album_info(opts[:artist])
				end
			else
				return album
			end
		end
	end

end