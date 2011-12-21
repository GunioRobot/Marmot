namespace :popcorn do

	desc "Parse and save all new tracks in the file system"
	task :save_tracks => :environment do
		raise "Must supply PARSE_PATH= path" unless ENV['PARSE_PATH']

		start_time = Time.now
		parse = Parser::Base.new({:root_file_path => ENV['PARSE_PATH']})
		puts "About to fetch_song_files..."
		parse.fetch_song_files
		puts "About to save_files"
		parse.save_files
		puts "Finished in #{Time.now - start_time} seconds"
	end

end