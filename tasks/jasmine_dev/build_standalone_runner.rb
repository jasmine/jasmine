class JasmineDev < Thor
  include Thor::Actions

  desc "build_standalone_runner", "Build HTML spec runner for Jasmine standalone distribution"

  def build_standalone_runner
    say JasmineDev.spacer

    say "Building standalone runner HTML...", :cyan

    create_file File.join(standalone_temp_dir, 'SpecRunner.html') do
      template = Tilt.new(File.join('spec', 'templates','runner.html.erb'))

      scope = OpenStruct.new(:title => "Jasmine Spec Runner",
                             :favicon => example_favicon,
                             :jasmine_tags => example_jasmine_tags,
                             :source_tags => example_source_tags,
                             :spec_file_tags => example_spec_tags)
      template.render(scope)
    end
  end

  no_tasks do
    def standalone_temp_dir
      @standalone_temp_dir ||= File.join(Dir.tmpdir, 'jasmine_standalone', "jasmine-standalone-#{version_string}")
    end

    def example_path
      File.join('lib', "jasmine-#{version_string}")
    end

    def example_favicon
     %Q{<link rel="shortcut icon" type="image/png" href="#{example_path}/jasmine_favicon.png">}
    end

    def script_tags_for(files)
      srcs = (files.is_a?(String) ? [files] : files)
      srcs.inject([]) do |tags, file|
        tags << %Q{<script type="text/javascript" src="#{file}"></script>}
        tags
      end.join("\n  ")
    end

    def example_jasmine_tags
      tags = %Q{<link rel="stylesheet" type="text/css" href="#{example_path}/jasmine.css">}
      tags << "\n  "
      tags << script_tags_for(["#{example_path}/jasmine.js", "#{example_path}/jasmine-html.js"])
      tags
    end

    def example_source_tags
      script_tags_for ['src/Player.js', 'src/Song.js']
    end

    def example_spec_tags
      script_tags_for ['spec/SpecHelper.js', 'spec/PlayerSpec.js']
    end
  end
end
