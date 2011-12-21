RAILS_GEM_VERSION = '2.3.5' unless defined? RAILS_GEM_VERSION

require File.join(File.dirname(__FILE__), 'boot')

Rails::Initializer.run do |config|

	# Gems
	config.gem 'rbrainz', :version => '0.5.1'
	config.gem 'mb-discid', :version => '0.1.4'

  config.time_zone = 'UTC'
end

# last.fm API key
LAST_FM_KEY = 'f939e1649198a0eb4d426e665b12625f'

# requires...
require 'curb'
require 'hpricot'
require "mp3info"

load(File.join(RAILS_ROOT, 'lib', 'last_fm', 'last_fm.rb'))
load(File.join(RAILS_ROOT, 'lib', 'parser', 'parser.rb'))