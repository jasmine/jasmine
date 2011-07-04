require "bundler"
Bundler::GemHelper.install_tasks
require "term/ansicolor"
require "json"
require "tilt"

Dir["#{File.dirname(__FILE__)}/tasks/**/*.rb"].each do |file|
  require file
end

task :default => :spec

task :require_pages_submodule do
  raise "Submodule for Github Pages isn't present. Run git submodule update --init" unless pages_submodule_present
end

task :require_node do
  raise "\nNode.js is required to develop code for Jasmine. Please visit http://nodejs.org to install.\n\n" unless node_installed?
end

def pages_submodule_present
  File.exist?('pages/download.html')
end

def node_installed?
 `which node` =~ /node/
end

class String
  include Term::ANSIColor
end

Term::ANSIColor.coloring = STDOUT.isatty
