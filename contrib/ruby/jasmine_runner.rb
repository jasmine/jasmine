require 'erb'

module Jasmine
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
    def self.start(spec_dir, mappings)
      require "thin"

      config = {
        '/run.html' => Jasmine::RunAdapter.new(spec_dir)
      }
      mappings.each do |from, to|
        config[from] = Rack::File.new(to)
      end

      app = Rack::URLMap.new(config)

      Thin::Server.start('0.0.0.0', 8080, app)
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
      @driver.open(@http_address)

      until tests_have_finished? do
        sleep 0.1
      end

      puts @driver.get_eval("window.getResults()")
      failed_count = @driver.get_eval("window.jasmine.getEnv().currentRunner.getResults().failedCount").to_i
      failed_count == 0
    end
  end
end
