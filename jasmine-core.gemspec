# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "jasmine-core/version"

Gem::Specification.new do |s|
  s.name = "jasmine-core"
  s.version = Jasmine::Core::VERSION
  s.platform = Gem::Platform::RUBY
  s.authors = ["Rajan Agaskar", "Davis Frank", "Christian Williams"]
  s.summary = %q{JavaScript BDD framework}
  s.description = %q{Test your JavaScript without any framework dependencies, in any environment, and with a nice descriptive syntax.}
  s.email = %q{jasmine-js@googlegroups.com}
  s.homepage = "http://pivotal.github.com/jasmine"
  s.rubyforge_project = "jasmine-core"

  s.files         = Dir.glob("./lib/**/*") + Dir.glob("./lib/jasmine-core/spec/**/*.js")
  s.require_paths = ["lib"]
  s.add_development_dependency "term-ansicolor"
  s.add_development_dependency "json_pure", ">= 1.4.3"
  s.add_development_dependency "frank"
  s.add_development_dependency "ragaskar-jsdoc_helper"
end
