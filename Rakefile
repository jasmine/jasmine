require "bundler"
Bundler::GemHelper.install_tasks
require "json"
require "jasmine"
load "jasmine/tasks/jasmine.rake"

# TODO: Is there better way to invoke this using Jasmine gem???
desc "Run jasmine core specs in a browser."
task :core_spec do
  exec "ruby spec/jasmine_self_test_spec.rb"
end
task :default => :core_spec

