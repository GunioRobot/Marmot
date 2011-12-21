module LastFm
	class LastFmConnection

		attr_accessor :url, :retry_count, :tries

		def initialize(url)
			@url = url
			@tries = 1
		end

		# Gets the response body of the URL that's passed into the initialize method.
		def call_service
			# puts "Getting: #{self.url}"
			response = Curl::Easy.perform(self.url)
			Hpricot(response.body_str)
		rescue Timeout::Error => e
			retry_service(e)
		rescue Exception => e
			retry_service(e)
		end


		private

		# A little error handling helper that retries the service 10 times
		def retry_service(e) # e == rescued error
			if self.tries <= 10
				self.tries += 1
				# puts "Connection issues... retrying in 3 seconds"
				sleep(3)
				self.call_service
			else
				puts "Backtrace: #{e.backtrace}"
				puts "BIG TIME ERROR getting: #{self.url}"
			end
		end

	end
end