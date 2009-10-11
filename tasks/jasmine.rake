require File.expand_path(File.join(File.dirname(__FILE__), "..", "lib", "jasmine_helper.rb"))

def start_jasmine_server
  require File.expand_path(File.join(JasmineHelper.jasmine_root, "contrib/ruby/jasmine_spec_builder"))

  puts "your tests are here:"
  puts "  http://localhost:8888/run.html"

  Jasmine::SimpleServer.start(8888,
                              lambda { JasmineHelper.spec_file_urls },
                              JasmineHelper.dir_mappings)
end

namespace :jasmine do
  desc "Start jasmine server"
  task :server do
    start_jasmine_server
  end

  desc "Run continuous integration tests"
  task :ci do
    require "spec"
    require 'spec/rake/spectask'
    ENV["RAILS_ROOT"] = RAILS_ROOT
    Spec::Rake::SpecTask.new(:lambda_ci) do |t|   
      t.spec_opts = ["--color", "--format", "specdoc"]
      t.spec_files = [File.expand_path(File.join(File.dirname(__FILE__), "..", "lib", "jasmine_spec.rb"))]
    end
    Rake::Task[:lambda_ci].invoke
  end
end
