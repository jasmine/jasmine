def jasmine_sources
  sources  = ["src/base.js", "src/util.js", "src/Env.js", "src/Reporter.js", "src/Block.js"]
  sources += Dir.glob('src/*.js').reject { |f| f == 'src/base.js' || sources.include?(f) }.sort
  sources
end

def jasmine_html_sources
  ["src/html/TrivialReporter.js"]
end

def jasmine_version
  "#{version_hash['major']}.#{version_hash['minor']}.#{version_hash['build']}"
end

def version_hash
  require 'json'
  @version ||= JSON.parse(File.new("src/version.json").read);
end

task :default => 'jasmine:dist'

def substitute_jasmine_version(filename)
  contents = File.read(filename)
  contents = contents.gsub(/##JASMINE_VERSION##/, (jasmine_version))
  contents = contents.gsub(/[^\n]*REMOVE_THIS_LINE_FROM_BUILD[^\n]*/, '')
  File.open(filename, 'w') { |f| f.write(contents) }
end

namespace :jasmine do

  desc 'Prepares for distribution'
  task :dist => ['jasmine:build', 'jasmine:doc', 'jasmine:build_example_project', 'jasmine:fill_index_downloads']

  desc 'Check jasmine sources for coding problems'
  task :lint do
    passed = true
    jasmine_sources.each do |src|
      lines = File.read(src).split(/\n/)
      lines.each_index do |i|
        line = lines[i]
        undefineds = line.scan(/.?undefined/)
        if undefineds.include?(" undefined") || undefineds.include?("\tundefined")
          puts "Dangerous undefined at #{src}:#{i}:\n > #{line}"
          passed = false
        end

        if line.scan(/window/).length > 0
          puts "Dangerous window at #{src}:#{i}:\n > #{line}"
          passed = false
        end
      end
    end

    unless passed
      puts "Lint failed!"
      exit 1
    end
  end

  desc 'Builds lib/jasmine from source'
  task :build => :lint do
    puts 'Building Jasmine from source'

    sources = jasmine_sources
    version = version_hash

    old_jasmine_files = Dir.glob('lib/jasmine*.js')
    old_jasmine_files.each { |file| File.delete(file) }

    File.open("lib/jasmine.js", 'w') do |jasmine|
      sources.each do |source_filename|
        jasmine.puts(File.read(source_filename))
      end

      jasmine.puts %{
jasmine.version_= {
  "major": #{version['major'].to_json},
  "minor": #{version['minor'].to_json},
  "build": #{version['build'].to_json},
  "revision": #{Time.now.to_i}
};
}
    end

    File.open("lib/jasmine-html.js", 'w') do |jasmine_html|
      jasmine_html_sources.each do |source_filename|
        jasmine_html.puts(File.read(source_filename))
      end
    end

    FileUtils.cp("src/html/jasmine.css", "lib/jasmine.css")
  end

  downloads_file = 'pages/download.html.md'
  task :need_pages_submodule do
    unless File.exists?(downloads_file)
      raise "Jasmine pages submodule isn't present.  Run git submodule update --init"
    end
  end

  desc "Build jasmine documentation"
  task :doc => :need_pages_submodule do
    puts 'Creating Jasmine Documentation'
    require 'rubygems'
    require 'jsdoc_helper'

    FileUtils.rm_r "pages/jsdoc", :force => true

    JsdocHelper::Rake::Task.new(:lambda_jsdoc) do |t|
      t[:files] = jasmine_sources << jasmine_html_sources
      t[:options] = "-a"
      t[:out] = "pages/jsdoc"
      # JsdocHelper bug: template must be relative to the JsdocHelper gem, ick
      t[:template] = File.join("../".*(100), Dir::getwd, "jsdoc-template")
    end
    Rake::Task[:lambda_jsdoc].invoke
  end

  desc "Build example project"
  task :build_example_project => :need_pages_submodule do
    require 'tmpdir'

    temp_dir = File.join(Dir.tmpdir, 'jasmine-standalone-project')
    puts "Building Example Project in #{temp_dir}"
    FileUtils.rm_r temp_dir if File.exists?(temp_dir)
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

  task :fill_index_downloads do
    require 'digest/sha1'

    download_html = "<!-- START_DOWNLOADS -->\n"
    Dir.glob('pages/downloads/*.zip').sort.reverse.each do |f|
      sha1 = Digest::SHA1.hexdigest File.read(f)

      fn = f.sub(/^pages\//, '')
      version = /jasmine-standalone-(.*).zip/.match(f)[1]
      prerelease = /\.rc/.match(f)
      download_html += prerelease ? "<tr class=\"rc\">\n" : "<tr>\n"
      download_html += "  <td class=\"link\"><a href=\"#{fn}\">#{fn.sub(/downloads\//, '')}</a></td>\n"
      download_html += "  <td class=\"version\">#{version}</td>\n"
      download_html += "  <td class=\"size\">#{File.size(f) / 1024}k</td>\n"
      download_html += "  <td class=\"date\">#{File.mtime(f).strftime("%Y/%m/%d %H:%M:%S %Z")}</td>\n"
      download_html += "  <td class=\"sha\">#{sha1}</td>\n"
      download_html += "</tr>\n"
    end
    download_html += "<!-- END_DOWNLOADS -->"

    downloads_page = File.read(downloads_file)
    matcher = /<!-- START_DOWNLOADS -->.*<!-- END_DOWNLOADS -->/m
    downloads_page = downloads_page.sub(matcher, download_html)
    File.open(downloads_file, 'w') {|f| f.write(downloads_page)}
    puts "rewrote that file"
  end
end

task :jasmine => ['jasmine:dist']
