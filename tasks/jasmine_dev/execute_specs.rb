class JasmineDev < Thor

  desc "execute_specs_in_node", "Run all relevant specs in Node.js"

  def execute_specs_in_node
    return unless node_installed?

    invoke :build_distribution
    invoke :count_specs

    say JasmineDev.spacer

    say "Running all appropriate specs via Node.js...", :cyan

    with_color_option = STDOUT.isatty ? "--color" : "--noColor"

    run_with_output "node spec/node_suite.js #{with_color_option}", :capture => true
  end

  desc "execute_specs_in_browser", "Run all relevent specs in your default browser"

  def execute_specs_in_browser
    invoke :build_distribution
    invoke :count_specs

    say JasmineDev.spacer

    say "Running all appropriate specs via the default web browser...", :cyan

    open_specs_in_browser
  end

  desc "execute_specs", "Run all of Jasmine's JavaScript specs"

  def execute_specs
    invoke :execute_specs_in_node
    invoke :execute_specs_in_browser
  end

  no_tasks do
    def open_specs_in_browser
      require 'rbconfig'

      case Object.const_get(defined?(RbConfig) ? :RbConfig : :Config)::CONFIG['host_os']
        when /linux/
          run "xdg-open spec/runner.html"
        else
          run "open spec/runner.html"
      end
    end
  end
end
