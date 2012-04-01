require "bundler"
Bundler::GemHelper.install_tasks
require "term/ansicolor"
require "json"
require "tilt"

Dir["#{File.dirname(__FILE__)}/tasks/**/*.rb"].each do |file|
  require file
end

task :default => :spec

desc "Run all developement tests"
task :spec do
  system "rspec"
end

# Keeping this around for the Doc task, remove when doc is refactored
task :require_pages_submodule do
  raise "Submodule for Github Pages isn't present. Run git submodule update --init" unless pages_submodule_present
end

def pages_submodule_present
  File.exist?('pages/download.html')
end

class String
  include Term::ANSIColor
end

Term::ANSIColor.coloring = STDOUT.isatty
