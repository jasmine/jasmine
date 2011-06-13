desc "Build core jasmine.js"
task :build_dist => :lint do
  puts 'Building Jasmine distribution from source'

  concat_into('lib/jasmine.js') { [core_sources, version_source] }
  concat_into('lib/jasmine-html.js') { html_sources }

  FileUtils.cp('src/html/jasmine.css', 'lib/jasmine.css')
end

def concat_into(output_file, &block)
  files, extra = yield
  File.open(output_file, 'w') do |out|
    files.each do |f|
      out << File.read(f)
    end
    out << extra if extra
  end
end

desc 'Check jasmine sources for coding problems'
task :lint do
  puts "Running JSHint via Node.js"
  system("node jshint/run.js") || exit(1)
end

task :hint => :lint
