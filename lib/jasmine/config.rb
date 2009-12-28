module Jasmine
  class Config
    def initialize(options = {})
      require 'selenium_rc'
      @selenium_jar_path = SeleniumRC::Server.allocate.jar_path
      @options = options

      @browser = options[:browser] ? options.delete(:browser) : 'firefox'
      @selenium_pid = nil
      @jasmine_server_pid = nil
    end

    def start_server(port = 8888)
      Jasmine::Server.new(port, self).start
    end

    def start
      start_servers
      @client = Jasmine::SeleniumDriver.new("localhost", @selenium_server_port, "*#{@browser}", "http://localhost:#{@jasmine_server_port}/")
      @client.connect
    end

    def stop
      @client.disconnect
      stop_servers
    end

    def start_servers
      @jasmine_server_port = Jasmine::find_unused_port
      @selenium_server_port = Jasmine::find_unused_port

      @selenium_pid = fork do
        Process.setpgrp
        exec "java -jar #{@selenium_jar_path} -port #{@selenium_server_port} > /dev/null 2>&1"
      end
      puts "selenium started.  pid is #{@selenium_pid}"

      @jasmine_server_pid = fork do
        Process.setpgrp
        Jasmine::Server.start(@jasmine_server_port, spec_files, @options)
        exit! 0
      end
      puts "jasmine server started.  pid is #{@jasmine_server_pid}"

      Jasmine::wait_for_listener(@selenium_server_port, "selenium server")
      Jasmine::wait_for_listener(@jasmine_server_port, "jasmine server")
    end

    def stop_servers
      puts "shutting down the servers..."
      Jasmine::kill_process_group(@selenium_pid) if @selenium_pid
      Jasmine::kill_process_group(@jasmine_server_pid) if @jasmine_server_pid
    end

    def run
      begin
        start
        puts "servers are listening on their ports -- running the test script..."
        tests_passed = @client.run
      ensure
        stop
      end
      return tests_passed
    end

    def eval_js(script)
      @client.eval_js(script)
    end

    def mappings
      raise "You need to declare a mappings method in #{self.class}!"
    end

    def stylesheets
      []
    end

    def src_files
      []
    end

    def spec_files
      raise "You need to declare a spec_files method in #{self.class}!"
    end

    def match_files(dir, pattern)
      dir = File.expand_path(dir)
      Dir.glob(File.join(dir, pattern)).collect {|f| f.sub("#{dir}/", "")}.sort
    end

    def src_files
      match_files(src_dir, "**/*.js")
    end

    def src_path
      "src"
    end

    def spec_path
      "spec"
    end

    def spec_files
      match_files(spec_dir, "**/*.js")
    end

    def mappings
      {
          "/" + src_path => src_dir,
          "/" + spec_path => spec_dir
      }
    end

    def js_files
      src_files.collect {|f| File.join(src_path, f) } + spec_files.collect {|f| File.join(spec_path, f) }
    end

    def spec_files_full_paths
      spec_files.collect {|spec_file| File.join(spec_dir, spec_file) }
    end
  end
end