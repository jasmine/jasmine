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