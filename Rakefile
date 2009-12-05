namespace :jeweler do

  begin
    require 'jeweler'
    require 'rake'
    Jeweler::Tasks.new do |gemspec|
      gemspec.name = "jasmine-ruby"
      gemspec.summary = "Jasmine Ruby"
      gemspec.description = "Javascript BDD testings"
      gemspec.email = "ragaskar@gmail.com"
      gemspec.homepage = "http://github.com/ragaskar/jasmine-ruby"
      gemspec.description = "Jasmine Ruby"
      gemspec.authors = ["Rajan Agaskar"]
      gemspec.files = FileList.new('bin/*', 'lib/**/**', 'jasmine/lib/**', 'tasks/**', 'templates/**')

      gemspec.add_dependency('rspec', '>= 1.1.5')
      gemspec.add_dependency('rack', '>= 1.0.0')
      gemspec.add_dependency('json', '>= 1.1.9')
      gemspec.add_dependency('pivotal-selenium-rc', '>= 1.11.20090610')
      gemspec.add_dependency('selenium-client', '>= 1.2.17')
      gemspec.add_dependency('thin', '= 1.2.4')
    end
    Jeweler::GemcutterTasks.new
  rescue LoadError
    puts "Jeweler not available. Install it with: sudo gem install technicalpickles-jeweler -s http://gems.github.com"
  end
end
