desc "Run spec suite: Browser, Node, JSHint"
task :spec => ["build_jasmine_js", "spec:node", "spec:browser"]

desc 'Run specs in Node.js'
task "spec:node" => :require_node do
  puts "Running all appropriate specs via Node.js"
  system("node spec/node_suite.js")
end

desc "Run specs in the default browser (MacOS only)"
task "spec:browser" => :build_runner_html do
  puts "Running all appropriate specs via the default web browser"
  system("open spec/runner.html")
end

#def core_spec_count
#
#end