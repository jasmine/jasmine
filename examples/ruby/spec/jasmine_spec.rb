require 'rubygems'
require File.expand_path(File.join(File.dirname(__FILE__), "../../../contrib/ruby/jasmine_spec_builder"))
require "selenium_rc"

dir_mappings = {
  "/spec" => 'spec',
}

spec_files = Dir.glob("spec/**/*[Ss]pec.js")
jasmine_runner = Jasmine::Runner.new(SeleniumRC::Server.new.jar_path, spec_files, dir_mappings)
spec_builder = Jasmine::SpecBuilder.new(spec_files, jasmine_runner)

should_stop = false

Spec::Runner.configure do |config|
  config.after(:suite) do
    spec_builder.stop if should_stop
  end
end

spec_builder.start
should_stop = true
spec_builder.declare_suites
