require File.expand_path(File.join(File.dirname(__FILE__), "spec/jasmine_helper.rb"))

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

def start_jasmine_server(jasmine_includes = nil)
  require File.expand_path(File.join(JasmineHelper.jasmine_root, "contrib/ruby/jasmine_spec_builder"))

  puts "your tests are here:"
  puts "  http://localhost:8888/run.html"

  Jasmine::SimpleServer.start(8888,
                              lambda { JasmineHelper.spec_file_urls },
                              JasmineHelper.dir_mappings,
                              jasmine_includes)
end

namespace :jasmine do
  desc 'Builds lib/jasmine from source'
  task :build => 'jasmine:doc' do
    puts 'Building Jasmine from source'
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
    jasmine.close
  end

  desc "Build jasmine documentation"
  task :doc do
    puts 'Creating Jasmine Documentation'
    require 'rubygems'
    #sudo gem install ragaskar-jsdoc_helper
    require 'jsdoc_helper'


    JsdocHelper::Rake::Task.new(:lambda_jsdoc)
    Rake::Task[:lambda_jsdoc].invoke
  end


  desc "Run jasmine tests of source via server"
  task :server do
    jasmine_includes = lambda { jasmine_sources + ['lib/TrivialReporter.js'] }
    start_jasmine_server(jasmine_includes)
  end

  desc "Build jasmine and run tests via server"
  task :server_build => 'jasmine:build' do

    start_jasmine_server
  end

  namespace :test do
    desc "Run continuous integration tests"
    task :ci => 'jasmine:build' do
      require "spec"
      require 'spec/rake/spectask'
      Spec::Rake::SpecTask.new(:lambda_ci) do |t|
        t.spec_opts = ["--color", "--format", "specdoc"]
        t.spec_files = ["spec/jasmine_spec.rb"]
      end
      Rake::Task[:lambda_ci].invoke
    end

  end

end