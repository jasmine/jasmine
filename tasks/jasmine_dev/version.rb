class JasmineDev < Thor

  desc "write_version_files", "Write out version files"

  def write_version_files
    say JasmineDev.spacer

    say "Building version files", :cyan

    scope = OpenStruct.new(:major => version_object["major"],
                           :minor => version_object["minor"],
                           :build => version_object["build"],
                           :release_candidate => version_object["release_candidate"],
                           :revision => Time.now.to_i)

    js_template = Tilt.new(File.join(JasmineDev.project_root, 'src', 'templates', 'version.js.erb'))
    create_file File.join(JasmineDev.project_root, 'src', 'version.js'), :force => true do
      js_template.render(scope)
    end

    rb_template = Tilt.new(File.join(JasmineDev.project_root, 'src', 'templates', 'version.rb.erb'))

    create_file File.join(JasmineDev.project_root, 'lib', 'jasmine-core', 'version.rb'), :force => true do
      rb_template.render(scope)
    end
  end

  desc "display_version", "Display version currently stored in source"

  def display_version

    say "Current version information from src/version.json", :cyan

    say "Display version: "
    say "#{version_string}", :yellow

    say "Version object: "
    say "#{version_object_old}", :yellow
  end

  no_tasks do
    def version
      @version ||= File.read(File.join(JasmineDev.project_root, 'src', 'version.json'))
    end

    def version_string
      display = "#{version_object['major']}.#{version_object['minor']}.#{version_object['build']}"
      display += ".rc#{version_object['release_candidate']}" if version_object['release_candidate']
      display
    end

    def version_object
      @version_object ||= JSON.parse(version)
    end

    def version_object_old
      version.gsub("\n", " ").
        gsub(/\s+/, " ").
        gsub(/\}\s+$/, "}")
    end
  end
end