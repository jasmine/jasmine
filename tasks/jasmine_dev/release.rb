class JasmineDev < Thor

  desc 'release_prep', "Update version and build distributions"
  def release_prep
    say JasmineDev.spacer

    say "Building Release...", :cyan

    return unless pages_submodule_installed?

    invoke :build_github_pages
  end
end