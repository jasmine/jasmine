require File.expand_path(File.join(File.dirname(__FILE__), "jasmine_runner.rb"))

module Jasmine

  class RemoteResults
    attr_accessor :suites

    def initialize(spec_files)
      @spec_files = spec_files
      guess_example_locations
      load_suite_info
      @spec_results = {}
    end

    def script_path
      File.expand_path(__FILE__)
    end

    def guess_example_locations
      @example_locations = {}

      example_name_parts = []
      previous_indent_level = 0
      @spec_files.each do |filename|
        line_number = 1
        File.open(filename, "r") do |file|
          file.readlines.each do |line|
            match = /^(\s*)(describe|it)\s*\(\s*["'](.*)["']\s*,\s*function/.match(line)
            if (match)
              indent_level = match[1].length / 2
              example_name = match[3]
              example_name_parts[indent_level] = example_name

              full_example_name = example_name_parts.slice(0, indent_level + 1).join(" ")
              @example_locations[full_example_name] = "#{filename}:#{line_number}: in `it'"
            end
            line_number += 1
          end
        end
      end
    end

    def load_suite_info
      while eval('typeof reportingBridge == "undefined" || !!!reportingBridge.suiteInfoReady') do
        sleep 0.1
      end

      @suites = eval('Object.toJSON(reportingBridge.suiteInfo)')
    end

    def results_for(spec_id)
      spec_id = spec_id.to_s
      return @spec_results[spec_id] if @spec_results[spec_id]

      @spec_results[spec_id] = eval("Object.toJSON(reportingBridge.specResults[#{spec_id}])")
      while @spec_results[spec_id].nil? do
        sleep 0.1
        @spec_results[spec_id] = eval("Object.toJSON(reportingBridge.specResults[#{spec_id}])")
      end

      @spec_results[spec_id]
    end

    def declare_suites
      me = self
      suites.each do |suite|
        declare_suite(self, suite)
      end
    end

    def declare_suite(parent, suite)
      me = self
      parent.describe suite["name"] do
        suite["children"].each do |suite_or_spec|
          type = suite_or_spec["type"]
          if type == "suite"
            me.declare_suite(self, suite_or_spec)
          elsif type == "spec"
            me.declare_spec(self, suite_or_spec)
          else
            raise "unknown type #{type}"
          end
        end
      end
    end

    def declare_spec(parent, spec)
      me = self
      example_name = spec["name"]

      backtrace = @example_locations[parent.description + " " + example_name]
      parent.it example_name, {}, backtrace do
        me.report_spec(spec["id"])
      end
    end

    def report_spec(spec_id)
      spec_results = results_for(spec_id)

      messages = spec_results['messages'].join "\n---\n"
      puts messages
      fail messages if (spec_results['result'] != 'passed')
    end

    private

    def eval(js)
      @runner.eval(js)
    end
  end
end
  