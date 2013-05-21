source 'https://rubygems.org'
gem "rake"
gem "jasmine", :git => 'https://github.com/pivotal/jasmine-gem.git', :branch => '2_0'
#gem "jasmine", path: "/Users/pivotal/workspace/jasmine-gem"
unless ENV["TRAVIS"]
  group :debug do
    gem 'debugger'
  end
end

gemspec
