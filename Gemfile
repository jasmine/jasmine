source 'https://rubygems.org'
gem "jasmine", :git => 'https://github.com/pivotal/jasmine-gem.git'
# gem "jasmine", path: "/Users/pivotal/workspace/jasmine-gem"
unless ENV["TRAVIS"]
  group :debug do
    gem 'debugger'
  end
end

gemspec

gem "jasmine_selenium_runner", :git => 'https://github.com/jasmine/jasmine_selenium_runner.git'

gem "anchorman"
