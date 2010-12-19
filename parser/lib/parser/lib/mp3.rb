	module MediaType
		class Mp3

			attr_accessor :mp3
			attr_accessor :file_path

			# Initializes a new Parser::Mp3 object
			def initialize(file_path)
				@file_path = file_path
				@mp3 = Mp3Info.open(file_path, :encoding => 'utf-8')
				parse_file
			end

			def parse_file
				if is_a_valid_file?(self.file_path)
					save_file
				end
			end

			# protected

			def is_a_valid_file?(file_path)
				!mp3.tag.artist.blank? && !mp3.tag.album.blank? && !mp3.tag.title.blank? && !mp3.tag.tracknum.nil?
			end

			def save_file			
				begin
					# Extract the metadata from the mp3
					artist_name = mp3.tag.artist
					album_name = mp3.tag.album
					song_name = mp3.tag.title
					song_bitrate = mp3.bitrate
					song_samplerate = mp3.samplerate
					song_total_time = mp3.length
					song_track_number = mp3.tag.tracknum.to_i rescue nil
				
					if Artist.by_name({:key => artist_name}).first == nil
						Artist.create({
							:name => artist_name, 
							:about_short => "", 
							:about_long => "", 
							:albums => [], 
							:artist_images => []
						}).get_external_artist_info({:artist_info => true, :artist_images => true}) 
					end
				
					artist = Artist.by_name({:key => artist_name}).first
				
					if Album.by_name({:key => album_name}).first == nil
						album = Album.new({
							:name => album_name,
							:summary => "",
							:release_date => "",
							:album_image => "",
							:songs => []
						}).get_external_album_info(artist)
						
						artist.albums << album
						# artist.save
					end
					
					# album = Album.by_name({:key => album_name}).first
				
					album = artist.albums.find {|album| album["name"] == album_name}
					puts "Working on album: #{album.name}"
					album.songs << Song.create({
						:file_path => self.file_path,
						:name => song_name,
						:bit_rate => song_bitrate,
						:sample_rate => song_samplerate,
						:file_size => File.size(self.file_path),
						:track_number => song_track_number
					})
				
					artist.save
				rescue Exception => e
					puts e
				end
			end

		end
		
	end
