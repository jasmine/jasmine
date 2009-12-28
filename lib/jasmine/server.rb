module Jasmine
  class RunAdapter
    def initialize(config)
      @config = config
      @jasmine_files = [
        "/__JASMINE_ROOT__/lib/" + File.basename(Dir.glob("#{Jasmine.root}/lib/jasmine*.js").first),
        "/__JASMINE_ROOT__/lib/TrivialReporter.js",
        "/__JASMINE_ROOT__/lib/json2.js",
        "/__JASMINE_ROOT__/lib/consolex.js",
      ]
      @jasmine_stylesheets = ["/__JASMINE_ROOT__/lib/jasmine.css"]
    end

    def call(env)
      run
    end

    def run
      jasmine_files = @jasmine_files
      css_files = @jasmine_stylesheets + (Jasmine.files(@config.stylesheets) || [])
      js_files = Jasmine.files(@config.js_files)

      body = ERB.new(File.read(File.join(File.dirname(__FILE__), "run.html"))).result(binding)
      [
        200,
        { 'Content-Type' => 'text/html' },
        body
      ]
    end


  end

  class Redirect
    def initialize(url)
      @url = url
    end

    def call(env)
      [
        302,
        { 'Location' => @url },
        []
      ]
    end
  end

  class JsAlert
    def call(env)
      [
        200,
        { 'Content-Type' => 'application/javascript' },
        "document.write('<p>Couldn\\'t load #{env["PATH_INFO"]}!</p>');"
      ]
    end
  end

  class FocusedSuite
    def initialize(config)
      @config = config
#      @spec_files_or_proc = Jasmine.files(spec_files_or_proc) || []
#      @options = options
    end

    def call(env)
      spec_files = Jasmine.files(@config.spec_files_or_proc)
      matching_specs = spec_files.select {|spec_file| spec_file =~ /#{Regexp.escape(env["PATH_INFO"])}/ }.compact
      if !matching_specs.empty?
        run_adapter = Jasmine::RunAdapter.new(matching_specs, @options)
        run_adapter.run
      else
        [
          200,
          { 'Content-Type' => 'application/javascript' },
          "document.write('<p>Couldn\\'t find any specs matching #{env["PATH_INFO"]}!</p>');"
        ]
      end
    end

  end

  def self.files(f)
    result = f
    result = result.call if result.respond_to?(:call)
    result
  end

  class Server
    attr_reader :thin
    
    def initialize(port, config)
      @port = port
      @config = config

      require 'thin'
      thin_config = {
        '/__suite__' => Jasmine::FocusedSuite.new(@config),
        '/run.html' => Jasmine::Redirect.new('/'),
        '/' => Jasmine::RunAdapter.new(@config)
      }

      @config.mappings.each do |from, to|
        thin_config[from] = Rack::File.new(to)
      end

      thin_config["/__JASMINE_ROOT__"] = Rack::File.new(Jasmine.root)

      app = Rack::Cascade.new([
        Rack::URLMap.new(thin_config),
        JsAlert.new
      ])

      @thin = Thin::Server.new('0.0.0.0', @port, app)
    end

    def start
      begin
        thin.start
      rescue RuntimeError => e
        raise e unless e.message == 'no acceptor'
        raise RuntimeError.new("A server is already running on port #{@port}")
      end
    end

    def stop
      thin.stop
    end
  end

  class SimpleClient
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

      result = @driver.get_eval(" try { eval(#{escaped_script}, window); } catch(err) { window.eval(#{escaped_script}); }")
      JSON.parse("[#{result}]")[0]
    end
  end
end