module LastFm
	class LastFmArtistImage

		attr_accessor :artist_name, :artist_xml

		def initialize(args={})
			@artist_name = args[:artist_name]
			@artist_xml = @artist_xml ||= get_xml
		end

		def image(size='original')

			# <sizes>
			#   <size name="original" width="900" height="1553">
			#     http://userserve-ak.last.fm/serve/_/340992/Cher.jpg
			#   </size>
			#   <size name="large" width="126" height="217">http://....jpg</size>
			#   <size name="largesquare" width="126" height="126">http://....jpg</size>
			#   <size name="medium" width="64" height="110">http://....jpg</size>
			#   <size name="small" width="34" height="59">http://....jpg</size>
			# </sizes>

			search_xml("//lfm/images/image/sizes/size[@name='#{size}']").first.inner_html
		end

		def width(size)
			search_xml("//lfm/images/image/sizes/size[@name='#{size}']").first.attributes["width"]
		end

		def height(size)
			search_xml("//lfm/images/image/sizes/size[@name='#{size}']").first.attributes["height"]
		end


		protected

		# Searches the returned XML for a specific XPATH expression.
		#
		# Example: search_xml("//artist/image[@size='large']")
		def search_xml(search_path)
			self.artist_xml.search(search_path) rescue ""
		end

		# This method calls audioscrobbler's API and returns the xml which is stored in @artist_xml
		def get_xml
			url = "http://ws.audioscrobbler.com/2.0/?method=artist.getimages&artist=#{CGI::escape(self.artist_name)}&api_key=#{LAST_FM_KEY}"
			LastFm::LastFmConnection.new(url).call_service
		end


	end
end
