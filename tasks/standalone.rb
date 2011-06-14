desc "Build example project"
task :build_example_project => :need_pages_submodule do
  require 'tmpdir'

  temp_dir = File.join(Dir.tmpdir, 'jasmine-standalone-project')
  puts "Building Example Project in #{temp_dir}"
  FileUtils.rm_r temp_dir if File.exist?(temp_dir)
  Dir.mkdir(temp_dir)

  root = File.expand_path(File.dirname(__FILE__))
  FileUtils.cp_r File.join(root, 'example/.'), File.join(temp_dir)
  substitute_jasmine_version(File.join(temp_dir, "SpecRunner.html"))

  lib_dir = File.join(temp_dir, "lib/jasmine-#{jasmine_version}")
  FileUtils.mkdir_p(lib_dir)
  {
      "lib/jasmine.js" => "jasmine.js",
      "lib/jasmine-html.js" => "jasmine-html.js",
      "src/html/jasmine.css" => "jasmine.css",
      "MIT.LICENSE"  => "MIT.LICENSE"
  }.each_pair do |src, dest|
    FileUtils.cp(File.join(root, src), File.join(lib_dir, dest))
  end

  dist_dir = File.join(root, 'pages/downloads')
  zip_file_name = File.join(dist_dir, "jasmine-standalone-#{jasmine_version}.zip")
  puts "Zipping Example Project and moving to #{zip_file_name}"
  FileUtils.mkdir(dist_dir) unless File.exist?(dist_dir)
  if File.exist?(zip_file_name)
    puts "WARNING!!! #{zip_file_name} already exists!"
    FileUtils.rm(zip_file_name)
  end
  exec "cd #{temp_dir} && zip -r #{zip_file_name} . -x .[a-zA-Z0-9]*"
end
