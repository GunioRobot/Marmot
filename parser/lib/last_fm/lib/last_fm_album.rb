module LastFm
	class LastFmAlbum

		attr_accessor :artist_name, :album_name, :xml

		def initialize(args={})
			@artist_name = args[:artist_name]
			@album_name = args[:album_name]
			@xml = @xml ||= get_xml
		end

		def release_date
			date = search_xml("//lfm/album/releasedate").inner_html
			d = DateTime.parse(date.split(",").first)
			# puts "last.fm album date: #{d.to_s}"
			return d
		rescue Exception => e
			return nil
		end

		def image(size)
			# <image size="small">
			# 	http://userserve-ak.last.fm/serve/34s/8622967.jpg
			# </image>
			# <image size="medium">
			# 	http://userserve-ak.last.fm/serve/64s/8622967.jpg
			# </image>
			# <image size="large">
			# 	http://userserve-ak.last.fm/serve/174s/8622967.jpg
			# </image>
			# <image size="extralarge">
			# 	http://userserve-ak.last.fm/serve/300x300/8622967.jpg
			# </image>
			search_xml("//lfm/album/image[@size='#{size}']").first.inner_html rescue ''
		end

		def listeners
			search_xml("//lfm/album/listeners").inner_html rescue ""
		end

		def playcount
			search_xml("//lfm/album/playcount").inner_html rescue ""
		end

		def summary
			search_xml("//lfm/album/wiki/summary").inner_html rescue ""
		end

		def content
			search_xml("//lfm/album/wiki/content").inner_html rescue ""
		end

		def last_fm_album_url
			search_xml("//lfm/album/url").inner_html rescue ""
		end

		protected

		# Searches the returned XML for a specific XPATH expression.
		#
		# Example: search_xml("//artist/image[@size='large']")
		def search_xml(search_path)
			self.xml.search(search_path)
		rescue Exception => e
			puts "Error searching XML: #{e}"
		end

		# This method calls audioscrobbler's API and returns the xml which is stored in @artist_xml
		def get_xml
			url = "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=#{LAST_FM_KEY}&artist=#{CGI::escape(self.artist_name)}&album=#{CGI::escape(self.album_name)}"
			LastFm::LastFmConnection.new(url).call_service
		end

	end
end
