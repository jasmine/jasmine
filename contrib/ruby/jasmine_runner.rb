require 'socket'
require 'erb'

module Jasmine
  def self.find_unused_port
    socket = TCPserver.open(0)
    port = socket.addr[1]
    socket.close
    port
  end

  class RunAdapter
    def initialize(spec_files)
      p "spec_files: #{spec_files}"

      @spec_files = spec_files
    end

    def call(env)
      spec_files = @spec_files
      body = ERB.new(File.read(File.join(File.dirname(__FILE__), "run.html"))).result(binding)
      [
        200,
        { 'Content-Type' => 'text/html' },
        body
      ]
    end
  end

  class SimpleServer
    def self.start(port, spec_dir, mappings)
      require "thin"

      config = {
        '/run.html' => Jasmine::RunAdapter.new(spec_dir)
      }
      mappings.each do |from, to|
        config[from] = Rack::File.new(to)
      end

      app = Rack::URLMap.new(config)

      server_port = Jasmine::find_unused_port
      Thin::Server.start('0.0.0.0', port, app)
    end
  end

  class SimpleClient
    def initialize(selenium_host, selenium_port, selenium_browser_start_command, http_address)
      require 'selenium'
      @driver = Selenium::Client::Driver.new(
        selenium_host,
        selenium_port,
        selenium_browser_start_command,
        http_address
      )
      @http_address = http_address
    end

    def tests_have_finished?
      @driver.get_eval("window.jasmine.getEnv().currentRunner.finished") == "true"
    end

    def run()
      @driver.start
      @driver.open("/run.html")

      until tests_have_finished? do
        sleep 0.1
      end

      puts @driver.get_eval("window.getResults()")
      failed_count = @driver.get_eval("window.jasmine.getEnv().currentRunner.getResults().failedCount").to_i
      failed_count == 0
    end
  end

  class Runner
    def initialize(selenium_jar_path, spec_files, dir_mappings)
      @selenium_jar_path = selenium_jar_path
      @spec_files = spec_files
      @dir_mappings = dir_mappings
    end

    def run
      selenium_pid = nil
      jasmine_server_pid = nil
      begin
        jasmine_server_port = Jasmine::find_unused_port
        selenium_server_port = Jasmine::find_unused_port

        selenium_pid = fork do
          exec "java -jar #{@selenium_jar_path} -port #{selenium_server_port}"
        end
        puts "selenium started.  pid is #{selenium_pid}"

        jasmine_server_pid = fork do
          Jasmine::SimpleServer.start(jasmine_server_port, @spec_files, @dir_mappings)
        end
        puts "jasmine server started.  pid is #{jasmine_server_pid}"

        wait_for_listener(selenium_server_port, "selenium server")
        wait_for_listener(jasmine_server_port, "jasmine server")

        puts "servers are listening on their ports -- running the test script..."
        tests_passed = Jasmine::SimpleClient.new("localhost", selenium_server_port, "*firefox", "http://localhost:#{jasmine_server_port}/").run
      ensure
        puts "shutting down the servers..."
        Process.kill 15, selenium_pid if selenium_pid
        Process.kill 15, jasmine_server_pid if jasmine_server_pid
      end
      return tests_passed
    end
  end
end
