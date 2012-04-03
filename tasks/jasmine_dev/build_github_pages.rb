class JasmineDev < Thor

  desc "build_github_pages", "Build static pages for pivotal.github.com/jasmine"
  def build_github_pages(pages_dir = File.expand_path(File.join('.', 'pages')))
    say JasmineDev.spacer

    say "Building Github Pages...", :cyan

    return unless pages_submodule_installed?

    pages_output = File.join(pages_dir, 'pages_output')
    FileUtils.rm_r(pages_output) if File.exist?(pages_output)

    inside File.join('pages', 'pages_source') do
      run_with_output "frank export #{pages_output}", :capture => true
    end

    pages_files = Dir.chdir(pages_output) { Dir.glob('*') }

    pages_files.each do |file|
      source_path = File.join(pages_output, file)
      destination_path = File.join(pages_dir, file)

      if File.directory?(source_path)
        directory source_path, destination_path
      else
        copy_file source_path, destination_path
      end
    end
  end
end