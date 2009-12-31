require "#{File.dirname(__FILE__)}/vendor/gems/environment"
Bundler.require_env :rake

$LOAD_PATH.unshift File.expand_path("#{File.dirname(__FILE__)}/lib")

require 'spec'
require 'spec/rake/spectask'

desc "Run all examples"
Spec::Rake::SpecTask.new('spec') do |t|
  t.spec_files = FileList['spec/**/*.rb']
end

namespace :jasmine do
#  require 'jasmine'
  require 'spec/jasmine_self_test_config'

#  desc "Run continuous integration tests"
#  require "spec"
#  require 'spec/rake/spectask'
#  Spec::Rake::SpecTask.new(:ci) do |t|
#    t.spec_opts = ["--color", "--format", "specdoc"]
#    t.verbose = true
#    t.spec_files = [JasmineHelper.meta_spec_path]
#  end

  task :server do
    puts "your tests are here:"
    puts "  http://localhost:8888/run.html"

    JasmineSelfTestConfig.new.start_server
  end
end

desc "Run specs via server"
task :jasmine => ['jasmine:server']


namespace :jeweler do

  unless File.exists?('jasmine/lib')
    raise "Jasmine submodule isn't present.  Run git submodule init && git submodule update."
  end

  begin
    require 'jeweler'
    require 'rake'
    Jeweler::Tasks.new do |gemspec|
      gemspec.name = "jasmine"
      gemspec.summary = "Jasmine Ruby Runner"
      gemspec.description = "Javascript BDD test framework"
      gemspec.email = "ragaskar@gmail.com"
      gemspec.homepage = "http://github.com/pivotal/jasmine-ruby"
      gemspec.authors = ["Rajan Agaskar", "Christian Williams"]
      gemspec.files = FileList.new('bin/jasmine', 'lib/**/**', 'jasmine/lib/**', 'jasmine/contrib/ruby/**', 'tasks/**', 'templates/**')
      gemspec.add_dependency('rspec', '>= 1.1.5')
      gemspec.add_dependency('json', '>= 1.1.9')
      gemspec.add_dependency('rack', '>= 1.0.0')
      gemspec.add_dependency('thin', '>= 1.2.4')
      gemspec.add_dependency('selenium-rc', '>=2.1.0')
      gemspec.add_dependency('selenium-client', '>=1.2.17')
    end
    Jeweler::GemcutterTasks.new
  end
end
