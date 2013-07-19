require "bundler"
Bundler::GemHelper.install_tasks
require "json"
require "jasmine"

Dir["#{File.dirname(__FILE__)}/tasks/**/*.rb"].each do |file|
  require file
end

# TODO: Is there better way to invoke this using Jasmine gem???
task :core_spec do
  exec "ruby spec/jasmine_self_test_spec.rb"
end

namespace :jasmine do
  task :server do
    port = ENV['JASMINE_PORT'] || 8888
    jasmine_yml = ENV['JASMINE_YML'] || 'jasmine.yml'
    Jasmine.load_configuration_from_yaml(File.join(Dir.pwd, 'spec', jasmine_yml))
    config = Jasmine.config
    server = Jasmine::Server.new(port, Jasmine::Application.app(config))
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
