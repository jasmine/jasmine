desc 'Builds lib/jasmine from source'
task :build do

  # these files must be better
  sources  = ["src/base.js", "src/util.js", "src/Env.js", "src/ActionCollection.js", "src/Reporter.js"]

  sources += Dir.glob('src/*.js').reject{|f| sources.include?(f)}

  jasmine = File.new('lib/jasmine.js', 'w')
  sources.each do |source_filename|
    jasmine.puts(File.read(source_filename))
  end
end

