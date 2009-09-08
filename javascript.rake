namespace :spec do
  desc "Run continuous integration tests"
  require "spec"
  require 'spec/rake/spectask'

  Spec::Rake::SpecTask.new(:javascript) do |t|
    t.spec_opts = ["--color", "--format", "specdoc"]
    t.spec_files = ["spec/javascript/jasmine_spec.rb"]
  end


  desc "Run specs via server"
  task :jasmine_server do
    require File.expand_path(File.join(RAILS_ROOT, "spec/javascript/jasmine_helper.rb"))
    require File.expand_path(File.join(RAILS_ROOT, "spec/javascript/jasmine/contrib/ruby/jasmine_runner.rb"))


    includes = ['lib/' + File.basename(Dir.glob("#{JasmineHelper.jasmine_lib_dir}/jasmine*.js").first),
                'lib/json2.js',
                'lib/TrivialReporter.js']


    puts "your tests are here:"
    puts "  http://localhost:8888/run.html"

    Jasmine::SimpleServer.start(8888,
                                lambda { includes + JasmineHelper.spec_file_urls },
                                JasmineHelper.dir_mappings)
  end
end
