require 'rubygems'
require 'bundler/setup'
require 'jasmine'

Jasmine.load_configuration_from_yaml(File.join(Dir.pwd, 'spec', 'jasmine.yml'))
config = Jasmine.config
server = Jasmine::Server.new(config.port, Jasmine::Application.app(config))
driver = Jasmine::SeleniumDriver.new(config.browser, "#{config.host}:#{config.port}/")

t = Thread.new do
  begin
    server.start
  rescue ChildProcess::TimeoutError
  end
  # # ignore bad exits
end
t.abort_on_exception = true
Jasmine::wait_for_listener(config.port, "jasmine server")
puts "jasmine server started."

reporter = Jasmine::Runners::ApiReporter.new(driver, config.result_batch_size)
raw_results = Jasmine::Runners::HTTP.new(driver, reporter).run
results = Jasmine::Results.new(raw_results)

formatter = Jasmine::Formatters::Console.new(results)
puts formatter.failures
puts formatter.summary

exit results.failures.size