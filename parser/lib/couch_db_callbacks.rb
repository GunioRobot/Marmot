module CouchDbCallbacks

	# Generate a human readable slug from the artist's name
	## This is a callback set using CouchRest's save_callback hook
	def generate_slug_from_name
		self['slug'] = name.downcase.gsub(/[^a-z0-9]/,'-').squeeze('-').gsub(/^\-|\-$/,'') if new?
	end

end