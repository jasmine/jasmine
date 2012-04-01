class JasmineDev < Thor

  desc 'release_prep', "Update version and build distributions"
  def release_prep
    say JasmineDev.spacer

    say "Building Release...", :cyan

    return unless pages_submodule_installed?

    invoke :write_version_files
    invoke :build_distribution
    invoke :build_standalone_distribution
    invoke :build_github_pages
  end
end