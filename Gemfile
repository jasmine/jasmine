source :rubygems
gem "rake"
#gem "jasmine", git: 'https://github.com/pivotal/jasmine-gem.git'
gem "jasmine", path: '~/workspace/jasmine-gem'

unless ENV["TRAVIS"]
  group :debug do
    gem 'debugger'
  end
end

gemspec
