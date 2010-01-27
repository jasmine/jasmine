class JasmineGenerator < Rails::Generator::Base
  def manifest
    record do |m|

      m.directory "spec/javascripts"
      m.file "spec/javascripts/SpecHelper.js", "spec/javascripts/SpecHelper.js"
      m.file "spec/javascripts/ExampleSpec.js", "spec/javascripts/ExampleSpec.js"

      m.directory "spec/javascripts/support"
      m.file "spec/javascripts/support/jasmine_config.rb", "spec/javascripts/support/jasmine_config.rb"
      m.file "spec/javascripts/support/jasmine_spec.rb", "spec/javascripts/support/jasmine_spec.rb"
      m.file "spec/javascripts/support/jasmine-rails.yaml", "spec/javascripts/support/jasmine.yaml"

      m.directory "lib/tasks"
      m.file "lib/tasks/jasmine.rake", "lib/tasks/jasmine.rake"

      m.readme "INSTALL"
    end
  end

  def file_name
    "create_blog"
  end

end