desc "Build core jasmine.js"
task :build_dist => [:lint, :write_version_files] do
  puts 'Building Jasmine distribution from source'.cyan

  concat_into('./lib/jasmine-core/jasmine.js') { core_sources + version_source_file }
  concat_into('./lib/jasmine-core/jasmine-html.js') { html_sources }

  FileUtils.cp('./src/html/jasmine.css', './lib/jasmine-core/jasmine.css')
end

def concat_into(output_file, &block)
  files = yield
  File.open(output_file, 'w') do |out|
    files.each do |f|
      out << File.read(f)
    end
  end
end

desc 'Check jasmine sources for coding problems'
task :lint => :require_node do
  puts "Running JSHint via Node.js".cyan
  system("node jshint/run.js") || exit(1)
end

task :hint => :lint

task :write_version_files do
  scope = OpenStruct.new(:major => version_hash["major"],
                         :minor => version_hash["minor"],
                         :build => version_hash["build"],
                         :release_candidate => version_hash["release_candidate"],
                         :revision => Time.now.to_i)

  js_template = Tilt.new('./src/templates/version.js.erb')
  File.open('./src/version.js', 'w+') do |f|
    f << js_template.render(scope)
  end

  rb_template = Tilt.new('./src/templates/version.rb.erb')
  File.open('./lib/jasmine-core/version.rb', 'w+') do |f|
    f << rb_template.render(scope)
  end
end

def version_source_file
  Dir.glob('src/version.js')
end
