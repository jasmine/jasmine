require "bundler"
Bundler::GemHelper.install_tasks
require "json"
require "jasmine"
unless ENV["JASMINE_BROWSER"] == 'phantomjs'
  require "jasmine_selenium_runner"
end
load "jasmine/tasks/jasmine.rake"


