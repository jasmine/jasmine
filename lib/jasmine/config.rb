module Jasmine
  class Config
    require 'yaml'

    def initialize(options = {})
      require 'selenium_rc'
      @selenium_jar_path = SeleniumRC::Server.allocate.jar_path

      @browser = ENV["JASMINE_BROWSER"] || 'firefox'
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

    def start_jasmine_server
      @jasmine_server_port = Jasmine::find_unused_port
      server = Jasmine::Server.new(@jasmine_server_port, self)
      @jasmine_server_pid = fork do
        Process.setpgrp
        server.start
        exit! 0
      end
      puts "jasmine server started.  pid is #{@jasmine_server_pid}"
      Jasmine::wait_for_listener(@jasmine_server_port, "jasmine server")
    end

    def external_selenium_server_port
      ENV['SELENIUM_SERVER_PORT'] && ENV['SELENIUM_SERVER_PORT'].to_i > 0 ? ENV['SELENIUM_SERVER_PORT'].to_i : nil
    end

    def start_selenium_server
      @selenium_server_port = external_selenium_server_port
      if @selenium_server_port.nil?
        @selenium_server_port = Jasmine::find_unused_port
        @selenium_pid = fork do
          Process.setpgrp
          exec "java -jar #{@selenium_jar_path} -port #{@selenium_server_port} > /dev/null 2>&1"
        end
        puts "selenium started.  pid is #{@selenium_pid}"
      end
      Jasmine::wait_for_listener(@selenium_server_port, "selenium server")
    end

    def start_servers
      start_jasmine_server
      start_selenium_server
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

    def match_files(dir, patterns)
      dir = File.expand_path(dir)
      patterns.collect do |pattern|
        Dir.glob(File.join(dir, pattern)).collect {|f| f.sub("#{dir}/", "")}.sort
      end.flatten
    end

    def simple_config
      config = File.exist?(simple_config_file) ? File.open(simple_config_file) { |yf| YAML::load( yf ) } : false
      config || {}
    end


    def spec_path
      "/__spec__"
    end

    def root_path
      "/__root__"
    end

    def mappings
      {
        spec_path => spec_dir,
        root_path => project_root
      }
    end

    def js_files
      src_files.collect {|f| "/" + f } + spec_files.collect {|f| File.join(spec_path, f) }
    end

    def css_files
      stylesheets.collect {|f| "/" + f }
    end

    def spec_files_full_paths
      spec_files.collect {|spec_file| File.join(spec_dir, spec_file) }
    end

    def project_root
      Dir.pwd
    end

    def simple_config_file
      File.join(project_root, 'spec/javascripts/support/jasmine.yml')
    end

    def src_dir
      if simple_config['src_dir']
        File.join(project_root, simple_config['src_dir'])
      else
        project_root
      end
    end

    def spec_dir
      if simple_config['spec_dir']
        File.join(project_root, simple_config['spec_dir'])
      else
        File.join(project_root, 'spec/javascripts')
      end
    end

    def src_files
      files = []
      if simple_config['src_files']
        files = match_files(src_dir, simple_config['src_files'])
      end
      files
    end

    def spec_files
      files = match_files(spec_dir, "**/*.js")
      if simple_config['spec_files']
        files = match_files(spec_dir, simple_config['spec_files'])
      end
      files
    end

    def stylesheets
      files = []
      if simple_config['stylesheets']
        files = match_files(src_dir, simple_config['stylesheets'])
      end
      files
    end

  end
end
