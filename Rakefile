desc 'Builds lib/jasmine from source'
task :build do
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
  "revision": #{version['revision']}
  };
}
  sources.each do |source_filename|
    jasmine.puts(File.read(source_filename))
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
  require "spec"
  require 'spec/rake/spectask'

  task :ci => :build do
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
  puts "  http://localhost:8888/run.html"

  Jasmine::SimpleServer.start(8888, includes + spec_files, dir_mappings)
end