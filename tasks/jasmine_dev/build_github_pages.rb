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
  end
end