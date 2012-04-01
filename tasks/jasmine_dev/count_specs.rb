class JasmineDev < Thor

  desc "count_specs", "Count the number of specs for each test runner"
  def count_specs
    say JasmineDev.spacer
    say "Counting specs...", :cyan

    core_spec_count = count_specs_in(File.join('spec', 'core'))
    console_spec_count = count_specs_in(File.join('spec', 'console'))
    html_spec_count = count_specs_in(File.join('spec', 'html'))

    say "#{(core_spec_count + console_spec_count).to_s} ", :yellow
    say "specs for Node.js runner (exclude DOM-related specs)"
    say "#{(core_spec_count + console_spec_count + html_spec_count).to_s} ", :yellow
    say "specs for Browser runner (all specs)"
    say "\n"
    say "Please verify that these numbers match the runner output."
  end

  no_tasks do
    def count_specs_in(relative_path)
      files = Dir.glob(File.join(JasmineDev.project_root, relative_path, '*.js'))
      files.inject(0) do |count, file|
        File.read(file).scan(/\sit\s*\(/) { |s| count += 1 }
        count
      end
    end
  end
end