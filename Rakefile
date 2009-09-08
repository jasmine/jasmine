task :default => :noop

task :noop do
  puts "doing nothing"
end

desc 'Builds lib/jasmine from source'
namespace :build do
  task :jasmine => 'build:doc' do
    require 'json'
    sources = jasmine_sources
    version = version_hash
    old_jasmine_files = Dir.glob('lib/jasmine*.js')
    old_jasmine_files.each do |file|
      File.delete(file)
    end
    jasmine = File.new("lib/#{jasmine_filename version}", 'w')
    jasmine.puts(File.read(sources.shift))
    jasmine.puts %{
jasmine.version_= {
  "major": #{version['major']},
  "minor": #{version['minor']},
  "build": #{version['build']},
  "revision": #{Time.now.to_i}
  };
}
    sources.each do |source_filename|
      jasmine.puts(File.read(source_filename))
    end
  end

  desc "Build jasmine documentation"
  task :doc do
    require 'rubygems'
    #sudo gem install ragaskar-jsdoc_helper
    require 'jsdoc_helper'


    JsdocHelper::Rake::Task.new(:lambda_jsdoc)
    Rake::Task[:lambda_jsdoc].invoke
  end

end

def jasmine_sources
  sources  = ["src/base.js", "src/util.js", "src/Env.js", "src/Reporter.js", "src/Block.js"]

  sources += Dir.glob('src/*.js').reject{|f| f == 'src/base.js' || sources.include?(f)}.sort
end

def jasmine_filename(version)
  "jasmine-#{version['major']}.#{version['minor']}.#{version['build']}.js"
end

def version_hash
  JSON.parse(File.new("src/version.json").read);
end

namespace :test do
  desc "Run continuous integration tests"
  task :ci => 'build:jasmine' do
    require "spec"
    require 'spec/rake/spectask'
    Spec::Rake::SpecTask.new(:lambda_ci) do |t|
      t.spec_opts = ["--color", "--format", "specdoc"]
      t.spec_files = ["spec/jasmine_spec.rb"]
    end
    Rake::Task[:lambda_ci].invoke
  end

end

desc "Run jasmine tests via server"
task :jasmine_server do
  require File.expand_path(File.join(File.dirname(__FILE__), "contrib/ruby/jasmine_spec_builder"))

  includes = jasmine_sources + ['lib/TrivialReporter.js']
  spec_files = Dir.glob("spec/**/*.js")

  dir_mappings = {
    "/spec" => "spec",
    "/lib" => "lib",
    "/src" => 'src'
  }

  puts "your tests are here:"
  puts "  http://localhost:8888/"

  Jasmine::SimpleServer.start(8888, includes + spec_files, dir_mappings)
end