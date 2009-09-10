require 'rubygems'
require "selenium_rc"
require File.expand_path(File.join(File.dirname(__FILE__), "jasmine_helper.rb"))
require File.expand_path(File.join(JasmineHelper.jasmine_root, "contrib/ruby/jasmine_spec_builder"))

jasmine_runner = Jasmine::Runner.new(SeleniumRC::Server.new.jar_path,
                                     JasmineHelper.spec_file_urls,
                                     JasmineHelper.dir_mappings)

spec_builder = Jasmine::SpecBuilder.new(JasmineHelper.raw_spec_files, jasmine_runner)

should_stop = false

Spec::Runner.configure do |config|
  config.after(:suite) do
    spec_builder.stop if should_stop
  end
end

spec_builder.start
should_stop = true
spec_builder.declare_suites
