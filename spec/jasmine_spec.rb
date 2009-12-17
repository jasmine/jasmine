require 'rubygems'
require File.expand_path(File.join(File.dirname(__FILE__), "jasmine_helper.rb"))
require File.expand_path(File.join(JasmineHelper.jasmine_root, "contrib/ruby/jasmine_spec_builder"))

jasmine_runner = if ENV['SAUCELABS'] == 'true'
  require 'sauce_tunnel'
  require 'selenium_config'
  Jasmine::SauceLabsRunner.new(JasmineHelper.specs,
    JasmineHelper.dir_mappings,
    :saucelabs_config => 'saucelabs',
    :saucelabs_config_file => File.expand_path(File.join(File.dirname(__FILE__), "saucelabs.yml")))
else
  require "selenium_rc"
  Jasmine::Runner.new(SeleniumRC::Server.new.jar_path,
    JasmineHelper.specs,
    JasmineHelper.dir_mappings)
end

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
