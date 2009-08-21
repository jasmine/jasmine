desc 'Builds lib/jasmine from source'
task :build do
  require 'json'

  version = JSON.parse(File.new("src/version.json").read);
  sources  = ["src/util.js", "src/Env.js", "src/Reporter.js", "src/Block.js"]

  sources += Dir.glob('src/*.js').reject{|f| f == 'src/base.js' || sources.include?(f)}.sort
  old_jasmine_files = Dir.glob('lib/jasmine*.js')
  old_jasmine_files.each do |file|
    File.delete(file)
  end
  jasmine = File.new("lib/jasmine-#{version['major']}.#{version['minor']}.#{version['build']}.js", 'w')
  jasmine.puts(File.read('src/base.js'))
  jasmine.puts %{
jasmine.version_= {
  "major": #{version['major']},
  "minor": #{version['minor']},
  "build": #{version['build']},
  "revision": #{version['revision']}
  };
}
  sources.each do |source_filename|
    jasmine.puts(File.read(source_filename))
  end
end