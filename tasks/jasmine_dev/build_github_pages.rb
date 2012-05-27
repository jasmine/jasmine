class JasmineDev < Thor

  desc "build_github_pages", "Build static pages for pivotal.github.com/jasmine"
  def build_github_pages(pages_dir = File.expand_path(File.join('.', 'pages')))
    say JasmineDev.spacer

    say "Building Github Pages...", :cyan

    return unless pages_submodule_installed?

    project_lib_dir = File.join(JasmineDev.project_root, 'lib', 'jasmine-core')

    pages_lib_dir = File.join(pages_dir, 'lib')
    FileUtils.rm_r(pages_lib_dir) if File.exist?(pages_lib_dir)

    ['jasmine.js', 'jasmine-html.js', 'jasmine.css'].each do |file|
      copy_file File.join(project_lib_dir, file), File.join(pages_lib_dir, file)
    end

    inside File.join(JasmineDev.project_root, 'pages', 'src') do
      run_with_output "bundle exec rocco -l js introduction.js -t layout.mustache -o #{pages_dir}"
    end

    inside pages_dir do
      copy_file File.join(pages_dir,'introduction.html'), File.join(pages_dir,'index.html')
    end
  end
end