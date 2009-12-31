require File.expand_path(File.join(File.dirname(__FILE__), "spec_helper"))

require 'jasmine_self_test_config'

jasmine_config = JasmineSelfTestConfig.new
spec_builder = Jasmine::SpecBuilder.new(jasmine_config)

should_stop = false

Spec::Runner.configure do |config|
  config.after(:suite) do
    spec_builder.stop if should_stop
  end
end

spec_builder.start
should_stop = true
spec_builder.declare_suites
