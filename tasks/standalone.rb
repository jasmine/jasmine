require 'ostruct'

desc "Build standalone distribution"
task :standalone => [:require_pages_submodule, :protect_current_dist_zip, :build_spec_runner_html] do
  require 'tmpdir'

  zip_root = File.join(Dir.tmpdir, "zip_root")
  temp_dir = File.join(zip_root, "jasmine-standalone-#{version_string}")
  puts "Building Example Project in #{temp_dir}"
  FileUtils.rm_r temp_dir if File.exist?(temp_dir)
  FileUtils.mkdir_p(temp_dir)

  root = File.expand_path(File.join(File.dirname(__FILE__), '..'))
  FileUtils.mkdir_p(File.join(root, "example"))
  FileUtils.cp_r(File.join(root, 'example/.'), File.join(temp_dir))

  lib_dir = File.join(temp_dir, "lib/jasmine-#{version_string}")
  FileUtils.mkdir_p(lib_dir)
  {
    "images/jasmine_favicon.png" => "jasmine_favicon.png",
    "lib/jasmine-core/jasmine.js" => "jasmine.js",
    "lib/jasmine-core/jasmine-html.js" => "jasmine-html.js",
    "lib/jasmine-core/jasmine.css" => "jasmine.css",
    "MIT.LICENSE" => "MIT.LICENSE"
  }.each_pair do |src, dest|
    FileUtils.cp(File.join(root, src), File.join(lib_dir, dest))
  end

  dist_dir = File.join(root, 'pages/downloads')
  zip_file_name = File.join(dist_dir, "jasmine-standalone-#{version_string}.zip")

  puts "Zipping Example Project and moving to #{zip_file_name}"
  exec "cd #{zip_root} && zip #{zip_file_name} -r . -x .[a-zA-Z0-9]*"
end

#Build SpecRunner.html for standalone dist example project
task :build_spec_runner_html do
  template = Tilt.new('spec/templates/runner.html.erb')

  File.open('lib/jasmine-core/example/SpecRunner.html', 'w+') do |f|
    scope = OpenStruct.new(:title => "Jasmine Spec Runner",
                           :favicon => example_favicon,
                           :jasmine_tags => example_jasmine_tags,
                           :source_tags => example_source_tags,
                           :spec_file_tags => example_spec_tags)
    f << template.render(scope)
  end
end

def example_path
  "lib/jasmine-#{version_string}"
end

def example_favicon
  <<HTML
<link rel="shortcut icon" type="image/png" href="#{example_path}/jasmine_favicon.png">
HTML
end

def example_jasmine_tags
  tags = %Q{<link rel="stylesheet" type="text/css" href="#{example_path}/jasmine.css">}
  tags << "\n  "
  tags << script_tags_for(["#{example_path}/jasmine.js", "#{example_path}/jasmine-html.js"])
  tags
end

def example_source_tags
  script_tags_for ['spec/SpecHelper.js', 'spec/PlayerSpec.js']
end

def example_spec_tags
  script_tags_for ['src/Player.js', 'src/Song.js']
end


task :protect_current_dist_zip do
  root = File.expand_path(File.join(File.dirname(__FILE__), '..'))
  dist_dir = File.join(root, 'pages/downloads')
  zip_file_name = File.join(dist_dir, "jasmine-standalone-#{version_string}.zip")

  zip_present_message = "\n\n"
  zip_present_message << "==> STOPPED <==".red
  zip_present_message << "\n\n"
  zip_present_message << "The file ".red + "#{zip_file_name}" + " already exists.".red + "\n"
  zip_present_message << "If you should be building the next version, update src/version.json"
  zip_present_message << "\n"
  zip_present_message << "If the version is correct, you must be trying to re-build the standalone ZIP. Delete the ZIP and rebuild."
  zip_present_message << "\n"

  raise zip_present_message if File.exist?(zip_file_name)
end
