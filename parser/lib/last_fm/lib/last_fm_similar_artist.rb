module LastFm

	class LastFmSimilarArtist

		attr_accessor :artist_name, :artist_xml

		def initialize(args={})
			@artist_name = args[:artist_name]
			@artist_xml = @artist_xml ||= get_xml
			@artists = []
		end

		def similar_artists
			search_xml("//similarartists/")
			(@artist_xml/:artist).each do |artist|
				artist_name = (artist/'name').inner_html
				artist_url = (artist/'url').inner_html
				artist_image = (artist/"image[@size='large']").inner_html
				@artists << {:name => artist_name, :url => artist_url, :image => artist_image} unless self.artist_name == artist_name
			end
			@artists
		end

		protected

		# Searches the returned XML for a specific XPATH expression.
		#
		# Example: search_xml("//artist/image[@size='large']")
		def search_xml(search_path)
			self.artist_xml.search(search_path)
		rescue Exception => e
			puts "Error searching XML: #{e}"
		end

		# This method calls audioscrobbler's API and returns the xml which is stored in @artist_xml
		def get_xml
			url = "http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=#{CGI::escape(self.artist_name)}&api_key=#{LAST_FM_KEY}"
			LastFm::LastFmConnection.new(url).call_service
		end

	end
end