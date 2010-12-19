module LastFm
	class LastFmArtistInfo
		
		attr_accessor :artist_name, :artist_xml
		
		def initialize(args={})
			@artist_name = args[:artist_name]
			@artist_xml = @artist_xml ||= get_xml
		end
				
		# methods that extract data from the XML chunk
		
		# Extract the artist summary. This summary is a brief description
		def summary 
			search_xml("//artist/bio/summary").inner_html rescue ""
		end
		
		# Extract the artist content. This is the summary plus a longer description
		def content
			search_xml("//artist/bio/content").inner_html rescue ""
		end
		
		# Get the artist image. Pass in 'large', 'medium', or 'small'
		def image(size)
			search_xml("//artist/image[@size='#{size}']").first.inner_html rescue ""
		end
		
		# Get the number of last.fm users that have listened to this artist
		def listeners
			search_xml("//artist/stats/listeners").inner_html rescue ""
		end
		
		# Get the total play count of all the songs added up for this artist
		def playcount
			search_xml("//artist/stats/playcount").inner_html rescue ""
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
			# url = "http://ws.audioscrobbler.com/2.0/artist/#{CGI::escape(self.artist_name)}/info.xml"
			artist_name_for_call = URI.escape(CGI.escape(self.artist_name),'.')
			# puts "Artist name for last.fm call: #{artist_name_for_call}"
			url = "http://ws.audioscrobbler.com/2.0/artist/#{artist_name_for_call}/info.xml"
			LastFm::LastFmConnection.new(url).call_service
		rescue Exception => e
			puts "Error getting: #{CGI::escape(self.artist_name)} - #{url}"
		end
		
	end
end
