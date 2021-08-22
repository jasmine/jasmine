if ENV["SUPPRESS_JASMINE_DEPRECATION"].nil?
  puts <<~END_DEPRECATION_MSG
    The Jasmine Ruby gems are deprecated. There will be no further releases after
    the end of the Jasmine 3.x series. We recommend that most users migrate to the
    jasmine-browser-runner npm package, which is the direct replacement for the
    jasmine gem. See <https://jasmine.github.io/setup/browser.html> for setup
    instructions, including for Rails applications that use either Sprockets or
    Webpacker.

    If jasmine-browser-runner doesn't meet your needs, one of these might:

    * The jasmine npm package to run specs in Node.js:
      <https://github.com/jasmine/jasmine-npm>
    * The standalone distribution to run specs in browsers with no additional
      tools: <https://github.com/jasmine/jasmine#installation>
    * The jasmine-core npm package if all you need is the Jasmine assets:
      <https://github.com/jasmine/jasmine>. This is the direct equivalent of the
      jasmine-core Ruby gem.

    To prevent this message from appearing, set the SUPPRESS_JASMINE_DEPRECATION
    environment variable.

  END_DEPRECATION_MSG
end

module Jasmine
  module Core
    class << self
      def path
        File.join(File.dirname(__FILE__), "jasmine-core")
      end

      def js_files
        (["jasmine.js"] + Dir.glob(File.join(path, "*.js"))).map { |f| File.basename(f) }.uniq - boot_files - ["boot0.js", "boot1.js"] - node_boot_files
      end

      SPEC_TYPES = ["core", "html", "node"]

      def core_spec_files
        spec_files("core")
      end

      def html_spec_files
        spec_files("html")
      end

      def node_spec_files
        spec_files("node")
      end

      def boot_files
        ["boot.js"]
      end

      def node_boot_files
        ["node_boot.js"]
      end

      def boot_dir
        path
      end

      def spec_files(type)
        raise ArgumentError.new("Unrecognized spec type") unless SPEC_TYPES.include?(type)
        (Dir.glob(File.join(path, "spec", type, "*.js"))).map { |f| File.join("spec", type, File.basename(f)) }.uniq
      end

      def css_files
        Dir.glob(File.join(path, "*.css")).map { |f| File.basename(f) }
      end

      def images_dir
        File.join(File.dirname(__FILE__), '../images')
      end

    end
  end
end
