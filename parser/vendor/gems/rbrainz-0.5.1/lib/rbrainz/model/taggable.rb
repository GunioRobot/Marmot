# -*- coding: utf-8 -*-
# $Id: taggable.rb 266 2009-05-24 22:15:22Z phw $
#
# Author::    Philipp Wolfer (mailto:phw@rubyforge.org)
# Copyright:: Copyright (c) 2009, Philipp Wolfer
# License::   RBrainz is free software distributed under a BSD style license.
#             See LICENSE[file:../LICENSE.html] for permissions.

require 'rbrainz/model/tag'

module MusicBrainz
  module Model

    # Mixin module to add folksonomy tagging capabilities to Entity classes.
    #
    # see:: Tag
    module Taggable
      
      # Returns a Collection of Tag objects assigned to this entity.
      def tags
        @tags ||= Collection.new
      end
      
    end
      
  end
end
