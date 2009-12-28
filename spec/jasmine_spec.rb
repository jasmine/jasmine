require 'jasmine_self_test_config'

jasmine_runner = JasmineSelfTestRunner.new
spec_builder = Jasmine::SpecBuilder.new(jasmine_runner)

should_stop = false

Spec::Runner.configure do |config|
  config.after(:suite) do
    spec_builder.stop if should_stop
  end
end

spec_builder.start
should_stop = true
spec_builder.declare_suites
