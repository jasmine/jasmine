require 'rubygems'
require 'bundler/setup'
require 'jasmine'

Jasmine.load_configuration_from_yaml(File.join(Dir.pwd, 'spec', 'jasmine.yml'))
config = Jasmine.config

browser = ENV['JASMINE_BROWSER'] || 'firefox'

if ENV['USE_SAUCE'] == 'true'
  require 'selenium-webdriver'

  unless ENV['TRAVIS_BUILD_NUMBER']
    require 'sauce/connect'

    # we want Sauce Connect locally, not on Travis
    Sauce::Connect.connect!
  end

  username = ENV['SAUCE_USERNAME']
  key = ENV['SAUCE_ACCESS_KEY']
  platform = ENV['SAUCE_PLATFORM']
  version = ENV['SAUCE_VERSION']
  url = "http://#{username}:#{key}@localhost:4445/wd/hub"

  config.port = 5555

  capabilities = {
      :platform => platform,
      :version => version,
      :build => ENV['TRAVIS_BUILD_NUMBER'],
      :tags => [ENV['TRAVIS_RUBY_VERSION'], 'CI'],
      :browserName => browser
  }

  capabilities.merge!('tunnel-identifier' => ENV['TRAVIS_JOB_NUMBER']) if ENV['TRAVIS_JOB_NUMBER']

  webdriver = Selenium::WebDriver.for :remote, :url => url, :desired_capabilities => capabilities
end

Jasmine.configure do |config|
  config.webdriver = webdriver if webdriver
  config.browser = browser if browser
end
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

reporter = Jasmine::Reporters::ApiReporter.new(driver, config.result_batch_size)
raw_results = Jasmine::Runners::HTTP.new(driver, reporter).run
results = Jasmine::Results.new(raw_results)

formatter = Jasmine::Formatters::Console.new(results)
puts formatter.failures
puts formatter.summary

exit results.failures.size