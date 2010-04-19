require File.expand_path(File.join(File.dirname(__FILE__), "spec/jasmine_helper.rb"))

def jasmine_sources
  sources  = ["src/base.js", "src/util.js", "src/Env.js", "src/Reporter.js", "src/Block.js"]
  sources += Dir.glob('src/*.js').reject{|f| f == 'src/base.js' || sources.include?(f)}.sort
  sources
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

  Jasmine::SimpleServer.start(
    8888,
    lambda { JasmineHelper.specs },
    JasmineHelper.dir_mappings,
    :jasmine_files => jasmine_includes)
end

task :default => 'jasmine:dist'

namespace :jasmine do

  desc 'Prepares for distribution'
  task :dist => ['jasmine:build', 'jasmine:doc']

  desc 'Check jasmine sources for coding problems'
  task :lint do
    passed = true
    jasmine_sources.each do |src|
      lines = File.read(src).split(/\n/)
      lines.each_index do |i|
        line = lines[i]
        undefineds = line.scan(/.?undefined/)
        if undefineds.include?(" undefined") || undefineds.include?("\tundefined")
          puts "Dangerous undefined at #{src}:#{i}:\n > #{line}"
          passed = false
        end
      end
    end

    unless passed
      puts "Lint failed!"
      exit 1
    end
  end

  desc 'Builds lib/jasmine from source'
  task :build => :lint do
    puts 'Building Jasmine from source'
    require 'json'

    sources = jasmine_sources
    version = version_hash

    old_jasmine_files = Dir.glob('lib/jasmine*.js')
    old_jasmine_files.each do |file|
      File.delete(file)
    end

    jasmine = File.new("lib/#{jasmine_filename version}", 'w')

    sources.each do |source_filename|
      jasmine.puts(File.read(source_filename))
    end

    jasmine.puts %{
jasmine.version_= {
  "major": #{version['major']},
  "minor": #{version['minor']},
  "build": #{version['build']},
  "revision": #{Time.now.to_i}
  };
}

    jasmine.close
  end

  desc "Build jasmine documentation"
  task :doc do
    puts 'Creating Jasmine Documentation'
    require 'rubygems'
    #sudo gem install ragaskar-jsdoc_helper
    require 'jsdoc_helper'


    JsdocHelper::Rake::Task.new(:lambda_jsdoc) do |t|
      t[:files] = jasmine_sources << 'lib/TrivialReporter.js'
      t[:options] = "-a"
    end
    Rake::Task[:lambda_jsdoc].invoke
  end


  task :server do
    files = jasmine_sources + ['lib/TrivialReporter.js', 'lib/consolex.js']
    jasmine_includes = lambda {
      raw_jasmine_includes = files.collect { |f| File.expand_path(File.join(JasmineHelper.jasmine_root, f)) }
      Jasmine.cachebust(raw_jasmine_includes).collect {|f| f.sub(JasmineHelper.jasmine_src_dir, "/src").sub(JasmineHelper.jasmine_lib_dir, "/lib") }
    }
    start_jasmine_server(jasmine_includes)
  end

  task :server_build => 'jasmine:build' do

    start_jasmine_server
  end

  namespace :test do
    task :ci => :'ci:local'
    namespace :ci do

      task :local => 'jasmine:build' do
        require "spec"
        require 'spec/rake/spectask'
        Spec::Rake::SpecTask.new(:lambda_ci) do |t|
          t.spec_opts = ["--color", "--format", "specdoc"]
          t.spec_files = ["spec/jasmine_spec.rb"]
        end
        Rake::Task[:lambda_ci].invoke
      end

      task :saucelabs => ['jasmine:copy_saucelabs_config', 'jasmine:build'] do
        ENV['SAUCELABS'] = 'true'
        Rake::Task['jasmine:test:ci:local'].invoke
      end
    end
  end

  desc 'Copy saucelabs.yml to work directory'
  task 'copy_saucelabs_config' do
    FileUtils.cp '../saucelabs.yml', 'spec'
  end
end

task :jasmine => ['jasmine:server']
