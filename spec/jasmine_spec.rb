require 'rubygems'
require File.expand_path(File.join(File.dirname(__FILE__), "../contrib/ruby/jasmine_spec_builder"))
require "selenium_rc"

dir_mappings = {
  "/spec" => 'spec',
  "/lib" => 'lib',
  "/src" => 'src'
}

def jasmine_sources
  sources  = ["src/base.js", "src/util.js", "src/Env.js", "src/Reporter.js", "src/Block.js"]

  sources += Dir.glob('src/*.js').reject{|f| f == 'src/base.js' || sources.include?(f)}.sort
end

includes = jasmine_sources + ['lib/json2.js', 'lib/TrivialReporter.js']
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
