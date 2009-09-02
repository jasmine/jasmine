require 'rubygems'
require File.expand_path(File.join(File.dirname(__FILE__), "../../../contrib/ruby/jasmine_spec_builder"))
require "selenium_rc"


JASMINE_LIB = File.expand_path(File.join(File.dirname(__FILE__), '../../../lib'))
dir_mappings = {
  "/spec" => 'spec',
  "/lib" => JASMINE_LIB
}

includes = ['lib/' + File.basename(Dir.glob("#{JASMINE_LIB}/jasmine*.js").first),
            'lib/json2.js',
            'lib/TrivialReporter.js']

spec_files = Dir.glob("spec/**/*[Ss]pec.js")
jasmine_runner = Jasmine::Runner.new(SeleniumRC::Server.new.jar_path, includes + spec_files, dir_mappings)
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
