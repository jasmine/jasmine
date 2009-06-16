desc 'Builds lib/jasmine from source'
task :build do
  sources = [ "src/base.js",
    "src/util.js",
    "src/Env.js",
    "src/ActionCollection.js",
    "src/Matchers.js",
    "src/NestedResults.js",
    "src/PrettyPrinter.js",
    "src/QueuedFunction.js",
    "src/Reporters.js",
    "src/Runner.js",
    "src/Spec.js",
    "src/Suite.js"]

  jasmine = File.new('lib/jasmine.js', 'w')
  sources.each do |source_filename|
    jasmine.puts(File.read(source_filename))
  end
end