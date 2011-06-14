require 'json'
require 'tilt'

Dir["#{File.dirname(__FILE__)}/tasks/**/*.rb"].each do |file|
  require file
end

task :default => :spec

task :require_pages_submodule do
  raise "Submodule for Github Pages isn't present. Run git submodule update --init" unless File.exist?('pages/download.html')
end

task :require_node do
  raise "\nNode.js is required to develop code for Jasmine. Please visit http://nodejs.org to install.\n\n" unless node_installed?
end

def node_installed?
 `which node` =~ /node/
end


#namespace :jasmine do
#
#  desc 'Prepares for distribution'
#  task :dist => ['jasmine:build',
#                 'jasmine:doc',
#                 'jasmine:build_pages',
#                 'jasmine:build_example_project',
#                 'jasmine:fill_index_downloads']
#
#  end
#
#  downloads_file = 'pages/download.html'
#  task :need_pages_submodule do
#    unless File.exist?(downloads_file)
#      raise "Jasmine pages submodule isn't present.  Run git submodule update --init"
#    end
#  end
#
#  desc "Build the Github pages HTML"
#  task :build_pages => :need_pages_submodule do
#    Dir.chdir("pages") do
#      FileUtils.rm_r('pages_output') if File.exist?('pages_output')
#      Dir.chdir('pages_source') do
#        system("frank export ../pages_output")
#      end
#      puts "\nCopying Frank output to the root of the gh-pages branch\n\n"
#      system("cp -r pages_output/* .")
#    end
#  end
#
#  desc "Build jasmine documentation"
#  task :doc => :need_pages_submodule do
#    puts 'Creating Jasmine Documentation'
#    require 'rubygems'
#    require 'jsdoc_helper'
#
#    FileUtils.rm_r "pages/jsdoc", :force => true
#
#    JsdocHelper::Rake::Task.new(:lambda_jsdoc) do |t|
#      t[:files] = jasmine_sources << jasmine_html_sources
#      t[:options] = "-a"
#      t[:out] = "pages/jsdoc"
#      # JsdocHelper bug: template must be relative to the JsdocHelper gem, ick
#      t[:template] = File.join("../".*(100), Dir::getwd, "jsdoc-template")
#    end
#    Rake::Task[:lambda_jsdoc].invoke
#  end
#
#  desc "Build example project"
#  task :build_example_project => :need_pages_submodule do
#    require 'tmpdir'
#
#    temp_dir = File.join(Dir.tmpdir, 'jasmine-standalone-project')
#    puts "Building Example Project in #{temp_dir}"
#    FileUtils.rm_r temp_dir if File.exist?(temp_dir)
#    Dir.mkdir(temp_dir)
#
#    root = File.expand_path(File.dirname(__FILE__))
#    FileUtils.cp_r File.join(root, 'example/.'), File.join(temp_dir)
#    substitute_jasmine_version(File.join(temp_dir, "SpecRunner.html"))
#
#    lib_dir = File.join(temp_dir, "lib/jasmine-#{jasmine_version}")
#    FileUtils.mkdir_p(lib_dir)
#    {
#        "lib/jasmine.js" => "jasmine.js",
#        "lib/jasmine-html.js" => "jasmine-html.js",
#        "src/html/jasmine.css" => "jasmine.css",
#        "MIT.LICENSE"  => "MIT.LICENSE"
#    }.each_pair do |src, dest|
#      FileUtils.cp(File.join(root, src), File.join(lib_dir, dest))
#    end
#
#    dist_dir = File.join(root, 'pages/downloads')
#    zip_file_name = File.join(dist_dir, "jasmine-standalone-#{jasmine_version}.zip")
#    puts "Zipping Example Project and moving to #{zip_file_name}"
#    FileUtils.mkdir(dist_dir) unless File.exist?(dist_dir)
#    if File.exist?(zip_file_name)
#      puts "WARNING!!! #{zip_file_name} already exists!"
#      FileUtils.rm(zip_file_name)
#    end
#    exec "cd #{temp_dir} && zip -r #{zip_file_name} . -x .[a-zA-Z0-9]*"
#  end
#
#end
