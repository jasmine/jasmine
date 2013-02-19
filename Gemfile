source :rubygems
gem "rake"
gem "jasmine", :git => 'https://github.com/pivotal/jasmine-gem.git', :branch => '2_0'

unless ENV["TRAVIS"]
  group :debug do
    gem 'debugger'
  end
end

gemspec
