class JasmineDev < Thor
  include Thor::Actions

  desc "build_standalone_distribution", "Build Jasmine standalone distribution"
  def build_standalone_distribution(download_dir = File.expand_path(File.join('.', 'pages', 'downloads')))
    invoke :build_distribution

    say JasmineDev.spacer

    say "Building standalone distribution...", :cyan

    say "Staging files...", :yellow

    lib_files.each do |f|
      copy_file f, File.join(standalone_temp_dir, 'lib', "jasmine-#{version_string}", f)
    end

    ['src', 'spec'].each do |dir|
      directory File.join('lib', 'jasmine-core', 'example', dir),
                File.join(standalone_temp_dir, dir)
    end

    invoke :build_standalone_runner

    say "Zipping distribution...", :yellow

    inside standalone_temp_dir do
      run_with_output "zip -rq ../jasmine-standalone-#{version_string}.zip ."

      say "Copying Zip file to downloads directory", :yellow
      run "cp ../jasmine-standalone-#{version_string}.zip #{download_dir}"
    end

  end

  no_tasks do
    def standalone_temp_dir
      @standalone_temp_dir ||= File.join(Dir.tmpdir, 'jasmine_standalone', "jasmine-standalone-#{version_string}")
    end

    def lib_files
      %w{ jasmine.js jasmine-html.js jasmine.css MIT.LICENSE }
    end

    def example_path
      File.join('lib', "jasmine-#{version_string}")
    end
  end
end