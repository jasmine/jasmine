# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "jasmine-core/version"

Gem::Specification.new do |s|
  s.name = "jasmine-core"
  s.version = Jasmine::Core::VERSION
  s.platform = Gem::Platform::RUBY
  s.authors = ["Gregg Van Hove"]
  s.summary = %q{JavaScript BDD framework}
  s.description = %q{Test your JavaScript without any framework dependencies, in any environment, and with a nice descriptive syntax.}
  s.email = %q{jasmine-js@googlegroups.com}
  s.homepage = "http://jasmine.github.io"
  s.license = "MIT"

  s.files         = Dir.glob("./lib/**/*")
  s.require_paths = ["lib"]
  s.add_development_dependency "rake"
end
