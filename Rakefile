require "bundler"
Bundler::GemHelper.install_tasks
require "json"
require "tilt"

Dir["#{File.dirname(__FILE__)}/tasks/**/*.rb"].each do |file|
  require file
end

desc "Run all Jasmine JS specs"
task :jasmine_specs do
  jasmine_dev = JasmineDev.new

  return unless jasmine_dev.node_installed?

  system "thor jasmine_dev:execute_specs"

  puts "\n\033[33m>>> DEPRECATED <<< Run Jasmine's JavaScript specs with 'thor jasmine_dev:execute_specs'\n\033[0m"
end

desc "Run all Jasmine core tests (JavaScript and dev tasks)"
task :spec => :require_pages_submodule do
  jasmine_dev = JasmineDev.new

  return unless jasmine_dev.node_installed?

  system "rspec"
end

task :require_pages_submodule do
  jasmine_dev = JasmineDev.new

  unless jasmine_dev.pages_submodule_installed?
    puts 'Installing the Github pages submodule:'
    system 'git submodule update --init'
    puts 'Now continuing...'
  end
end

desc "View full development tasks"
task :list_dev_tasks do
  puts "Jasmine uses Thor for command line tasks for development. Here is the command set:"
  system "thor list"
end

require "jasmine"
require 'rspec'
require 'rspec/core/rake_task'

desc "Run all examples"
RSpec::Core::RakeTask.new(:jasmine_core_spec) do |t|
  t.pattern = 'spec/jasmine_self_test_spec.rb'
end

namespace :jasmine do
  task :server do
    port = ENV['JASMINE_PORT'] || 8888
    Jasmine.load_configuration_from_yaml(File.join(Dir.pwd, 'spec', 'jasmine.yml'))
    config = Jasmine.config
    server = Jasmine::Server.new(8888, Jasmine::Application.app(config))
    server.start

    puts "your tests are here:"
    puts "  http://localhost:#{port}/"
  end

  desc "Copy examples from Jasmine JS to the gem"
  task :copy_examples_to_gem do
    require "fileutils"

    # copy jasmine's example tree into our generator templates dir
    FileUtils.rm_r('generators/jasmine/templates/jasmine-example', :force => true)
    FileUtils.cp_r(File.join(Jasmine::Core.path, 'example'), 'generators/jasmine/templates/jasmine-example', :preserve => true)
  end
end

desc "Run specs via server"
task :jasmine => ['jasmine:server']


