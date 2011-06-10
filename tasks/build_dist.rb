desc "Build core jasmine.js"
task :build_jasmine_js => :lint do
  puts 'Building Jasmine from source'

  File.open("lib/jasmine.js", 'w') do |jasmine_js|
    core_sources.each do |source_filename|
      file = File.read(source_filename)
#      file += "\n" unless file.match(/\n$/)
      file.chomp
      jasmine_js << file
    end

    jasmine_js << version_source
  end

  File.open("lib/jasmine-html.js", 'w') do |jasmine_html|
    html_sources.each do |source_filename|
      jasmine_html.puts(File.read(source_filename))
    end
  end

  FileUtils.cp("src/html/jasmine.css", "lib/jasmine.css")
end

desc 'Check jasmine sources for coding problems'
task :lint do
  puts "Running JSHint via Node.js"
  system("node jshint/run.js") || exit(1)
end

task :hint => :lint
