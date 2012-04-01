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
      paths = JasmineDev::JASMINE_SOURCES[:core].collect do |f|
        File.join(JasmineDev.project_root, 'src', 'core', f)
      end

      paths << File.join(JasmineDev.project_root, 'src', 'version.js')
      paths
    end

    def jasmine_html_js_paths
      JasmineDev::JASMINE_SOURCES[:html].collect do |f|
        File.join(JasmineDev.project_root, 'src', 'html', f)
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