module Jasmine
  module Core
    class << self
      def path
        File.join(File.dirname(__FILE__), "jasmine-core")
      end

      def js_files
        (["jasmine.js"] + Dir.glob(File.join(path, "*.js"))).map { |f| File.basename(f) }.uniq
      end

      def css_files
        Dir.glob(File.join(path, "*.css")).map { |f| File.basename(f) }
      end
    end
  end
end
