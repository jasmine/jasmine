source :rubygems
gem "rake"
gem "jasmine", git: 'https://github.com/pivotal/jasmine-gem.git'

unless ENV["TRAVIS"]
  group :debug do
    gem 'debugger'
  end
end
 
gemspec
