class Song < CouchRestRails::Document

	# Tell CouchDB to use the artist database
	use_database :artist

	property :file_path
	property :name
	property :bit_rate
	property :sample_rate
	property :file_size
	property :track_length
	property :track_number

	property :slug

	unique_id :slug

	timestamps!

	validates_presence_of :name

	view_by :file_path

	set_callback :save, :before, :generate_slug_from_name

	def generate_slug_from_name
		splitted_file_path = self.file_path.split("/")
		joined_string = splitted_file_path[splitted_file_path.size - 3] + "-" + splitted_file_path[splitted_file_path.size - 2] + "-" + splitted_file_path[splitted_file_path.size - 1]
		self['slug'] = joined_string.downcase.gsub(/[^a-z0-9]/,'-').squeeze('-').gsub(/^\-|\-$/,'') if new?
	end


end