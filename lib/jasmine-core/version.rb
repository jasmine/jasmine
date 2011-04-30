module Jasmine
  module Core
    require 'json'
    VERSION_HASH = JSON.parse(File.new(File.join(File.dirname(__FILE__), "..", "..", "src/version.json")).read);
    VERSION = "#{VERSION_HASH['major']}.#{VERSION_HASH['minor']}.#{VERSION_HASH['build']}"
  end
end
