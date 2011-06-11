module Jasmine
  module Core
    require 'json'
    VERSION_HASH = JSON.parse(File.new(File.join(File.dirname(__FILE__), "..", "..", "src", "core", "version.json")).read);
    VERSION = "#{VERSION_HASH['major']}.#{VERSION_HASH['minor']}.#{VERSION_HASH['build']}"
    VERSION << ".rc#{VERSION_HASH['release_candidate']}" if VERSION_HASH['release_candidate']
  end
end
