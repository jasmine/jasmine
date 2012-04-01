class JasmineDev < Thor

  desc "build_distribution", "Build Jasmine js & css files"
  def build_distribution(directory = "./lib/jasmine-core")
    invoke :js_hint

    say JasmineDev.spacer

    say "Building Jasmine distribution from source into #{directory}", :cyan

    say 'Building JavaScript...', :yellow

    inside directory do
      create_file "jasmine.js",
                  concat_contents_of(jasmine_js_paths),
                  :force => true
      create_file "jasmine-html.js",
                  concat_contents_of(jasmine_html_js_paths),
                  :force => true
    end

    say 'Building CSS...', :yellow

    run "compass compile", :capture => true

    copy_file File.join("#{JasmineDev.project_root}", 'src', 'html', 'jasmine.css'),
              File.join(directory, 'jasmine.css')
  end

  no_tasks do
    def jasmine_js_paths
      sources_list = File.read(File.join(JasmineDev.project_root, 'src', 'SourcesList.json'))
      first_paths = JSON.parse(sources_list).collect do |f|
        File.join(JasmineDev.project_root, 'src', 'core', f)
      end

      remaining_paths = Dir.glob(File.join(JasmineDev.project_root, 'src', 'core', '*.js'))
      remaining_paths << File.join(JasmineDev.project_root, 'src', 'version.js')

      add_only_new_elements(first_paths, remaining_paths)
    end

    def jasmine_html_js_paths
      first_paths = []
      first_paths << File.join(JasmineDev.project_root, 'src', 'html', 'HtmlReporterHelpers.js')
      first_paths += Dir.glob(File.join('.', 'src', 'html', '*.js'))

      remaining_paths = Dir.glob(File.join(JasmineDev.project_root, 'src', 'html', '*.js'))
      add_only_new_elements(first_paths, remaining_paths)
    end

    def add_only_new_elements(first, remaining)
      remaining.inject(first) do |result, element|
        result << element unless result.include?(element)
        result
      end
    end

    def concat_contents_of(paths)
      paths.inject("") do |string, path|
        string << File.read(path)
        string
      end
    end
  end
end