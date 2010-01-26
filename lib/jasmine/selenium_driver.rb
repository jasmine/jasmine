module Jasmine
  class SeleniumDriver
    def initialize(selenium_host, selenium_port, selenium_browser_start_command, http_address)
      require 'selenium/client'
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

    def connect
      @driver.start
      @driver.open("/")
    end

    def disconnect
      @driver.stop
    end

    def run
      until tests_have_finished? do
        sleep 0.1
      end

      puts @driver.get_eval("window.results()")
      failed_count = @driver.get_eval("window.jasmine.getEnv().currentRunner.results().failedCount").to_i
      failed_count == 0
    end

    def eval_js(script)
      escaped_script = "'" + script.gsub(/(['\\])/) { '\\' + $1 } + "'"

      result = @driver.get_eval("try { eval(#{escaped_script}, window); } catch(err) { window.eval(#{escaped_script}); }")
      JSON.parse("{\"result\":#{result}}")["result"]
    end
  end
end