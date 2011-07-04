desc "Build jasmine documentation"
task :doc => :require_pages_submodule do
  puts 'Creating Jasmine Documentation'
  require 'rubygems'
  require 'jsdoc_helper'

  FileUtils.rm_r "pages/jsdoc", :force => true

  JsdocHelper::Rake::Task.new(:lambda_jsdoc) do |t|
    t[:files] = core_sources + html_sources + console_sources
    t[:options] = "-a"
    t[:out] = "pages/jsdoc"
    # JsdocHelper bug: template must be relative to the JsdocHelper gem, ick
    t[:template] = File.join("../".*(100), Dir::getwd, "jsdoc-template")
  end
  Rake::Task[:lambda_jsdoc].invoke
end
