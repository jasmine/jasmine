require "bundler"
Bundler::GemHelper.install_tasks
require "json"
require "jasmine"
unless ENV["JASMINE_BROWSER"] == 'phantomjs'
  require "jasmine_selenium_runner"
end
load "jasmine/tasks/jasmine.rake"

namespace :jasmine do
  task :set_env do
    ENV['JASMINE_CONFIG_PATH'] ||= 'spec/support/jasmine.yml'
  end
end

task "jasmine:configure" => "jasmine:set_env"

