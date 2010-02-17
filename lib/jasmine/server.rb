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
      return not_found if env["PATH_INFO"] != "/"
      return [200,{ 'Content-Type' => 'text/html' }, ''] if (env['REQUEST_METHOD'] == 'HEAD')
      run if env['REQUEST_METHOD'] == 'GET'
    end

    def not_found
      body = "File not found: #{@path_info}\n"
      [404, {"Content-Type" => "text/plain",
         "Content-Length" => body.size.to_s,
         "X-Cascade" => "pass"},
       [body]]
    end

    #noinspection RubyUnusedLocalVariable
    def run
      jasmine_files = @jasmine_files
      css_files = @jasmine_stylesheets + (@config.css_files || [])
      js_files = @config.js_files

      body = ERB.new(File.read(File.join(File.dirname(__FILE__), "run.html.erb"))).result(binding)
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
    end

    def call(env)
      spec_files = @config.spec_files_or_proc
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
        Rack::URLMap.new({'/' => Rack::File.new(@config.src_dir)}),
        Rack::URLMap.new(thin_config)
#        JsAlert.new
      ])
#      Thin::Logging.trace = true
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
end