# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "jasmine-core/version"

Gem::Specification.new do |s|
  s.name = "jasmine-core"
  s.version = Jasmine::Core::VERSION
  s.platform = Gem::Platform::RUBY
  s.authors = ["Gregg Van Hove"]
  s.summary = %q{JavaScript BDD framework}
  s.description        = <<~DESC
    Test your JavaScript without any framework dependencies, in any environment,
    and with a nice descriptive syntax.

    Jasmine for Ruby is deprecated. The direct replacment for the jasmine-core
    gem is the jasmine-core NPM package. If you are also using the jasmine gem,
    we recommend using the jasmine-browser-runner NPM package instead. It
    supports all the same scenarios as the jasmine gem gem plus Webpacker. See
    https://jasmine.github.io/setup/browser.html for setup instructions, and
    https://github.com/jasmine/jasmine-gem/blob/main/release_notes/3.9.0.md
    for other options.
  DESC
  s.email = %q{jasmine-js@googlegroups.com}
  s.homepage = "http://jasmine.github.io"
  s.license = "MIT"

  s.files         = Dir.glob("./lib/**/*")
  s.require_paths = ["lib"]
  s.add_development_dependency "rake"
end
