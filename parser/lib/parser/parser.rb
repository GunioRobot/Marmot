module Parser
	class Base  # Parser::Base
		# Requries...
		require File.join(RAILS_ROOT,'lib','parser','lib','mp3.rb')

		attr_accessor :root_file_path    # The path to the root directory where media files live. A recursive search is performed.
		attr_accessor :songs_to_process  # Holds all the songs that need to be parsed.
		attr_accessor :valid_files			 # Works with the VALID_FILE_EXTENSIONS constant and creates upcase versions of the file extension just in case.

		# Valid file extensions to watch out for
		VALID_FILE_EXTENSIONS = ["mp3","m4a"]

		# Initializes a new Parser object.
		# Options are:
		#
		# * <tt>:root_file_path</tt> - The path to the root directory where audio files live. A recursive search will be performed on the directory to glob all files.
		def initialize(args={})
			@root_file_path = args[:root_file_path]
			@songs_to_process = []
		end

		# Fetches all the song files that are of the VALID_FILE_EXTENSION type. Iterates through them and puts them in the self.songs_to_process attribute
		def fetch_song_files
			Dir[self.parse_path_with_filter].each do |file_path|
				self.songs_to_process << file_path
			end
		end

		# Returns the root parse path with a file extension filter to use with Dir.glob.
		#
		# Returns a string like: /path/to/media/files/**/*.{MP3,mp3,M4A,m4a}
		def parse_path_with_filter
			File.join(self.root_file_path,"**","*.{#{self.valid_file_extensions.join(",")}}")
		end

		# Iterates through all the self.songs_to_process attribute. The file will be processed depending on the file extension.
		#
		# Checks the file extension and will use one of the following modules to extract the artist/album/song information:
		#
		# * Parser::MediaType::Mp3 - For *.mp3 files
		# * Parser::MediaType::Acc - For *.acc files
		# * Parser::MediaType::M4a - For *.m4a files
		def save_files
			self.songs_to_process.each do |file_path|
				puts "Working on: #{file_path}"
				case self.downcased_file_extension(file_path)
				when "mp3"
					MediaType::Mp3.new(file_path)
				# when "acc"
				# 	Parser::MediaType::Acc.new(file_path)
				# when "m4a"
				# 	Parser::MediaType::M4a.new(file_path)
				else
					p "Unable to process file: #{file_path}"
				end
			end
		end

		# Returns the the valid file extensions in upcase and downcase formats.
		#
		# Example: self.valid_file_extensions returns ["mp3","MP3","m4a","M4A"]
		def valid_file_extensions
			valid_files = []
			VALID_FILE_EXTENSIONS.each do |file_extension|
				valid_files << file_extension.upcase
				valid_files << file_extension
			end
			return valid_files
		end

		# protected

		# Checks to see if a particular song already exists in CouchDb.
		# Options are
		#
		# * <tt>file_path</tt> The path to the file
		#
		def song_does_not_exist?(file_path)
			Song.by_file_path(:key => file_path).first == nil
		end

		# Returns the file extension of a file in downcased format
		# Arguements are:
		#
		# * <tt>file_path</tt> - Pass in the file path to the mp3
		def downcased_file_extension(file_path)
			File.extname(file_path).downcase.gsub(".","")
		end

	end
end
