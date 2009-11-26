namespace :jasmine do
  require 'jasmine-ruby'
  helper_overrides = File.expand_path(File.join(File.dirname(__FILE__), "spec/helpers/jasmine_helper.rb"))
  if File.exist?(helper_overrides)
    require helper_overrides
  end

  desc "Run continuous integration tests"
  require "spec"
  require 'spec/rake/spectask'
  Spec::Rake::SpecTask.new(:ci) do |t|
    t.spec_opts = ["--color", "--format", "specdoc"]
    t.verbose = true
    t.spec_files = [JasmineHelper.meta_spec_path]
  end
  task :server do
    puts "your tests are here:"
    puts "  http://localhost:8888/run.html"

    Jasmine::SimpleServer.start(8888,
                                File.expand_path(Dir.pwd),
                                lambda { JasmineHelper.specs },
                                { :spec_helpers => JasmineHelper.files + JasmineHelper.spec_helpers,
                                  :stylesheets => JasmineHelper.stylesheets
                                })
  end
end

desc "Run specs via server"
task :jasmine => ['jasmine:server']
