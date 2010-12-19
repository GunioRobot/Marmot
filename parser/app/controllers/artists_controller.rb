class ArtistsController < ApplicationController
	
	def index
		@artists = Artist.all.paginate(:page => 1, :per_page => 20)
	end
	
	def show
		@artist = Artist.by_slug(:key => params[:id])
	end
	
end
